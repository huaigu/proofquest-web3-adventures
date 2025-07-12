import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase.js'
import { 
  validateUserData, 
  validateUserUpdateData,
  transformUserToApiFormat,
  transformUserToDbFormat,
  transformUserUpdateToDbFormat
} from '../lib/userValidation.js'
import type { UserInsert, UserUpdate } from '../types/database.js'
import type { UserResponse, UsersListResponse, ErrorResponse } from '../types/user.js'

export async function userRoutes(fastify: FastifyInstance) {
  // POST /api/users - Create or update user profile
  fastify.post<{
    Body: unknown
    Reply: { success: true; data: UserResponse } | ErrorResponse
  }>('/api/users', async (request, reply) => {
    try {
      // Validate request body
      const validation = validateUserData(request.body)
      
      if (!validation.success) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid user data provided',
          statusCode: 400,
          details: validation.errors
        })
      }

      // Transform to database format
      const userData = transformUserToDbFormat(validation.data)

      // Upsert user (insert or update if exists)
      const { data, error } = await supabase
        .from('users')
        .upsert(userData as UserInsert, { 
          onConflict: 'address',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        fastify.log.error('Database error creating/updating user:', error)
        
        // Handle specific database errors
        if (error.code === '23514') { // Check constraint violation
          return reply.status(400).send({
            error: 'Constraint Violation',
            message: 'User data violates database constraints',
            statusCode: 400,
            details: error.message
          })
        }
        
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to create/update user',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const userResponse = transformUserToApiFormat(data)

      fastify.log.info(`User profile created/updated for address: ${userResponse.address}`)

      return reply.status(201).send({
        success: true,
        data: userResponse
      })

    } catch (error) {
      fastify.log.error('Unexpected error creating/updating user:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // GET /api/users/:address - Get user profile by address
  fastify.get<{
    Params: { address: string }
    Reply: { success: true; data: UserResponse } | ErrorResponse
  }>('/api/users/:address', async (request, reply) => {
    try {
      const { address } = request.params

      // Validate EVM address format
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/
      if (!evmAddressRegex.test(address)) {
        return reply.status(400).send({
          error: 'Invalid Address',
          message: 'Address must be a valid EVM address',
          statusCode: 400
        })
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('address', address.toLowerCase())
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return reply.status(404).send({
            error: 'Not Found',
            message: 'User not found',
            statusCode: 404
          })
        }

        fastify.log.error('Database error fetching user:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to fetch user',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const userResponse = transformUserToApiFormat(data)

      return reply.send({
        success: true,
        data: userResponse
      })

    } catch (error) {
      fastify.log.error('Unexpected error fetching user:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // PUT /api/users/:address - Update user profile
  fastify.put<{
    Params: { address: string }
    Body: unknown
    Reply: { success: true; data: UserResponse } | ErrorResponse
  }>('/api/users/:address', async (request, reply) => {
    try {
      const { address } = request.params

      // Validate EVM address format
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/
      if (!evmAddressRegex.test(address)) {
        return reply.status(400).send({
          error: 'Invalid Address',
          message: 'Address must be a valid EVM address',
          statusCode: 400
        })
      }

      // Validate request body
      const validation = validateUserUpdateData(request.body)
      
      if (!validation.success) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid user update data provided',
          statusCode: 400,
          details: validation.errors
        })
      }

      // Transform to database format
      const updateData = transformUserUpdateToDbFormat(validation.data)

      // Update user
      const { data, error } = await supabase
        .from('users')
        .update(updateData as UserUpdate)
        .eq('address', address.toLowerCase())
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return reply.status(404).send({
            error: 'Not Found',
            message: 'User not found',
            statusCode: 404
          })
        }

        fastify.log.error('Database error updating user:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to update user',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const userResponse = transformUserToApiFormat(data)

      fastify.log.info(`User profile updated for address: ${userResponse.address}`)

      return reply.send({
        success: true,
        data: userResponse
      })

    } catch (error) {
      fastify.log.error('Unexpected error updating user:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // GET /api/users - List users with pagination
  fastify.get<{
    Querystring: {
      limit?: string
      offset?: string
      search?: string
    }
    Reply: { success: true; data: UsersListResponse } | ErrorResponse
  }>('/api/users', async (request, reply) => {
    try {
      const { limit = '20', offset = '0', search } = request.query

      // Build query
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply search filter if provided
      if (search) {
        query = query.or(`nickname.ilike.%${search}%,address.ilike.%${search}%`)
      }

      // Apply pagination
      const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100 items
      const offsetNum = parseInt(offset) || 0
      
      query = query.range(offsetNum, offsetNum + limitNum - 1)

      // Execute query
      const { data, error, count } = await query

      if (error) {
        fastify.log.error('Database error fetching users:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to fetch users',
          statusCode: 500,
          details: error.message
        })
      }

      // Transform to API response format
      const users = data?.map(transformUserToApiFormat) || []

      fastify.log.info(`Retrieved ${users.length} users`)

      return reply.send({
        success: true,
        data: {
          users,
          total: count || 0
        }
      })

    } catch (error) {
      fastify.log.error('Unexpected error fetching users:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })

  // DELETE /api/users/:address - Delete user profile
  fastify.delete<{
    Params: { address: string }
    Reply: { success: true; message: string } | ErrorResponse
  }>('/api/users/:address', async (request, reply) => {
    try {
      const { address } = request.params

      // Validate EVM address format
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/
      if (!evmAddressRegex.test(address)) {
        return reply.status(400).send({
          error: 'Invalid Address',
          message: 'Address must be a valid EVM address',
          statusCode: 400
        })
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('address', address.toLowerCase())

      if (error) {
        fastify.log.error('Database error deleting user:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to delete user',
          statusCode: 500,
          details: error.message
        })
      }

      fastify.log.info(`User profile deleted for address: ${address}`)

      return reply.send({
        success: true,
        message: 'User profile deleted successfully'
      })

    } catch (error) {
      fastify.log.error('Unexpected error deleting user:', error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      })
    }
  })
}