import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase.js'
import { 
  validateParticipationData,
  transformParticipationToApiFormat,
  transformParticipationToDbFormat
} from '../lib/userValidation.js'
import type { QuestParticipationInsert } from '../types/database.js'
import type { ParticipationResponse, UserParticipationsResponse, ErrorResponse } from '../types/user.js'

export async function participationRoutes(fastify: FastifyInstance) {
  // POST /api/participations - Join a quest
  fastify.post<{
    Body: unknown & { userAddress: string }
    Reply: { success: true; data: ParticipationResponse } | ErrorResponse
  }>('/api/participations', async (request, reply) => {
    try {
      const { userAddress, ...participationData } = request.body as any

      // Validate EVM address format
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/
      if (!evmAddressRegex.test(userAddress)) {
        return reply.status(400).send({
          error: 'Invalid Address',
          message: 'User address must be a valid EVM address',
          statusCode: 400
        })
      }

      // Validate participation data
      const validation = validateParticipationData(participationData)
      
      if (!validation.success) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid participation data provided',
          statusCode: 400,
          details: validation.errors
        })
      }

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('address')
        .eq('address', userAddress.toLowerCase())
        .single()

      if (userError || !user) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User must create a profile first',
          statusCode: 404
        })
      }

      // Check if quest exists and is active
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('id, status, start_date, end_date')
        .eq('id', validation.data.questId)
        .single()

      if (questError || !quest) {
        return reply.status(404).send({
          error: 'Quest Not Found',
          message: 'Quest does not exist',
          statusCode: 404
        })
      }

      // Check if quest is active and within time bounds
      const now = new Date()
      const startDate = new Date(quest.start_date)
      const endDate = new Date(quest.end_date)

      if (quest.status !== 'active') {
        return reply.status(400).send({
          error: 'Quest Not Active',
          message: 'Quest is not currently active',
          statusCode: 400
        })
      }

      if (now < startDate) {
        return reply.status(400).send({
          error: 'Quest Not Started',
          message: 'Quest has not started yet',
          statusCode: 400
        })
      }

      if (now > endDate) {
        return reply.status(400).send({
          error: 'Quest Ended',
          message: 'Quest has already ended',
          statusCode: 400
        })
      }

      // Transform to database format
      const participationDbData = transformParticipationToDbFormat(validation.data, userAddress)

      // Insert participation
      const { data, error } = await supabase
        .from('quest_participations')
        .insert(participationDbData as QuestParticipationInsert)
        .select()
        .single()

      if (error) {
        // Handle duplicate participation
        if (error.code === '23505') { // Unique constraint violation
          return reply.status(409).send({
            error: 'Already Participating',
            message: 'User is already participating in this quest',
            statusCode: 409
          })
        }

        fastify.log.error('Database error creating participation:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to join quest',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const participationResponse = transformParticipationToApiFormat(data)

      fastify.log.info(`User ${userAddress} joined quest ${validation.data.questId}`)

      return reply.status(201).send({
        success: true,
        data: participationResponse
      })

    } catch (error) {
      fastify.log.error('Unexpected error creating participation:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // GET /api/participations/user/:address - Get user's participations
  fastify.get<{
    Params: { address: string }
    Querystring: {
      status?: string
      limit?: string
      offset?: string
    }
    Reply: { success: true; data: UserParticipationsResponse } | ErrorResponse
  }>('/api/participations/user/:address', async (request, reply) => {
    try {
      const { address } = request.params
      const { status, limit = '20', offset = '0' } = request.query

      // Validate EVM address format
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/
      if (!evmAddressRegex.test(address)) {
        return reply.status(400).send({
          error: 'Invalid Address',
          message: 'Address must be a valid EVM address',
          statusCode: 400
        })
      }

      // Build query
      let query = supabase
        .from('quest_participations')
        .select('*', { count: 'exact' })
        .eq('user_address', address.toLowerCase())
        .order('joined_at', { ascending: false })

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status)
      }

      // Apply pagination
      const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100 items
      const offsetNum = parseInt(offset) || 0
      
      query = query.range(offsetNum, offsetNum + limitNum - 1)

      // Execute query
      const { data, error, count } = await query

      if (error) {
        fastify.log.error('Database error fetching participations:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to fetch participations',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const participations = data?.map(transformParticipationToApiFormat) || []

      return reply.send({
        success: true,
        data: {
          participations,
          total: count || 0
        }
      })

    } catch (error) {
      fastify.log.error('Unexpected error fetching participations:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // GET /api/participations/quest/:questId - Get quest's participants
  fastify.get<{
    Params: { questId: string }
    Querystring: {
      status?: string
      limit?: string
      offset?: string
    }
    Reply: { success: true; data: UserParticipationsResponse } | ErrorResponse
  }>('/api/participations/quest/:questId', async (request, reply) => {
    try {
      const { questId } = request.params
      const { status, limit = '20', offset = '0' } = request.query

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(questId)) {
        return reply.status(400).send({
          error: 'Invalid Quest ID',
          message: 'Quest ID must be a valid UUID',
          statusCode: 400
        })
      }

      // Build query
      let query = supabase
        .from('quest_participations')
        .select('*', { count: 'exact' })
        .eq('quest_id', questId)
        .order('joined_at', { ascending: false })

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status)
      }

      // Apply pagination
      const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100 items
      const offsetNum = parseInt(offset) || 0
      
      query = query.range(offsetNum, offsetNum + limitNum - 1)

      // Execute query
      const { data, error, count } = await query

      if (error) {
        fastify.log.error('Database error fetching quest participations:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to fetch quest participations',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const participations = data?.map(transformParticipationToApiFormat) || []

      return reply.send({
        success: true,
        data: {
          participations,
          total: count || 0
        }
      })

    } catch (error) {
      fastify.log.error('Unexpected error fetching quest participations:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // PUT /api/participations/:id - Update participation (e.g., submit proof)
  fastify.put<{
    Params: { id: string }
    Body: { proofUrl?: string; proofData?: any; status?: string }
    Reply: { success: true; data: ParticipationResponse } | ErrorResponse
  }>('/api/participations/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const { proofUrl, proofData, status } = request.body

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        return reply.status(400).send({
          error: 'Invalid Participation ID',
          message: 'Participation ID must be a valid UUID',
          statusCode: 400
        })
      }

      // Build update data
      const updateData: any = {}
      
      if (proofUrl !== undefined) {
        updateData.proof_url = proofUrl
      }
      if (proofData !== undefined) {
        updateData.proof_data = proofData
      }
      if (status !== undefined) {
        if (!['pending', 'completed', 'verified', 'rewarded'].includes(status)) {
          return reply.status(400).send({
            error: 'Invalid Status',
            message: 'Status must be one of: pending, completed, verified, rewarded',
            statusCode: 400
          })
        }
        updateData.status = status
        
        // Set timestamps based on status
        if (status === 'completed') {
          updateData.completed_at = new Date().toISOString()
        } else if (status === 'verified') {
          updateData.verified_at = new Date().toISOString()
        } else if (status === 'rewarded') {
          updateData.rewarded_at = new Date().toISOString()
        }
      }

      // Update participation
      const { data, error } = await supabase
        .from('quest_participations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Participation not found',
            statusCode: 404
          })
        }

        fastify.log.error('Database error updating participation:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to update participation',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const participationResponse = transformParticipationToApiFormat(data)

      fastify.log.info(`Participation ${id} updated`)

      return reply.send({
        success: true,
        data: participationResponse
      })

    } catch (error) {
      fastify.log.error('Unexpected error updating participation:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })
}