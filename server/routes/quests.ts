import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase.js'
import { validateQuestData, transformToDbFormat, transformToApiFormat } from '../lib/validation.js'
import { authenticate, getAuthenticatedAddress } from '../lib/authMiddleware.js'
import type { QuestInsert } from '../types/database.js'
import type { QuestResponse, ErrorResponse, QuestsListResponse } from '../types/quest.js'

export async function questRoutes(fastify: FastifyInstance) {
  // POST /api/quests - Create a new quest (requires authentication)
  fastify.post<{
    Body: unknown
    Reply: { success: true; data: QuestResponse } | ErrorResponse
  }>('/api/quests', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      // Get authenticated user address
      const creatorAddress = getAuthenticatedAddress(request)
      if (!creatorAddress) {
        return reply.status(401).send({
          error: 'Authentication Required',
          message: 'Must be authenticated to create a quest',
          statusCode: 401
        })
      }

      // Validate request body
      const validation = validateQuestData(request.body)
      
      if (!validation.success) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid quest data provided',
          statusCode: 400,
          details: validation.errors
        })
      }

      // Transform to database format
      const questDbData = transformToDbFormat(validation.data)
      
      // Set creator address from authenticated user
      questDbData.creator_id = creatorAddress

      // Insert into Supabase
      const { data, error } = await supabase
        .from('quests')
        .insert(questDbData as QuestInsert)
        .select()
        .single()

      if (error) {
        fastify.log.error('Database error creating quest:', error)
        
        // Handle specific database errors
        if (error.code === '23514') { // Check constraint violation
          return reply.status(400).send({
            error: 'Constraint Violation',
            message: 'Quest data violates database constraints',
            statusCode: 400,
            details: error.message
          })
        }
        
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to create quest',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const questResponse = transformToApiFormat(data)

      fastify.log.info(`Quest created successfully with ID: ${questResponse.id}`)

      return reply.status(201).send({
        success: true,
        data: questResponse
      })

    } catch (error) {
      fastify.log.error('Unexpected error creating quest:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // GET /api/quests - Get all quests
  fastify.get<{
    Querystring: {
      status?: string
      questType?: string
      limit?: string
      offset?: string
    }
    Reply: { success: true; data: QuestsListResponse } | ErrorResponse
  }>('/api/quests', async (request, reply) => {
    try {
      const { status, questType, limit = '50', offset = '0' } = request.query

      // Build query
      let query = supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }
      
      if (questType) {
        query = query.eq('quest_type', questType)
      }

      // Apply pagination (though user requested no pagination initially)
      const limitNum = Math.min(parseInt(limit) || 50, 100) // Max 100 items
      const offsetNum = parseInt(offset) || 0
      
      query = query.range(offsetNum, offsetNum + limitNum - 1)

      // Execute query
      const { data, error, count } = await supabase
        .from('quests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (error) {
        fastify.log.error('Database error fetching quests:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to fetch quests',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const quests = data?.map(transformToApiFormat) || []

      fastify.log.info(`Retrieved ${quests.length} quests`)

      return reply.send({
        success: true,
        data: {
          quests,
          total: count || 0
        }
      })

    } catch (error) {
      fastify.log.error('Unexpected error fetching quests:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // GET /api/quests/:id - Get a specific quest by ID
  fastify.get<{
    Params: { id: string }
    Reply: { success: true; data: QuestResponse } | ErrorResponse
  }>('/api/quests/:id', async (request, reply) => {
    try {
      const { id } = request.params

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        return reply.status(400).send({
          error: 'Invalid ID',
          message: 'Quest ID must be a valid UUID',
          statusCode: 400
        })
      }

      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Quest not found',
            statusCode: 404
          })
        }

        fastify.log.error('Database error fetching quest:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to fetch quest',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const questResponse = transformToApiFormat(data)

      return reply.send({
        success: true,
        data: questResponse
      })

    } catch (error) {
      fastify.log.error('Unexpected error fetching quest:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })
}