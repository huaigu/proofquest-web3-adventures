import { FastifyInstance } from 'fastify'
import { database } from '../lib/database.js'
import { 
  validateUserData, 
  validateUserUpdateData,
  transformUserToApiFormat,
  transformUserToDbFormat,
  transformUserUpdateToDbFormat
} from '../lib/userValidation.js'
import type { UserData } from '../types/database.js'
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
      const userData = transformUserToDbFormat(validation.data) as UserData

      try {
        // Add or update user
        await database.addUser(userData)
        
        // Get the updated user data
        const savedUser = await database.getUserByAddress(userData.address)
        if (!savedUser) {
          throw new Error('Failed to retrieve saved user')
        }

        // Transform to API response format
        const userResponse = transformUserToApiFormat(savedUser)

        fastify.log.info(`User profile created/updated for address: ${userResponse.address}`)

        return reply.status(201).send({
          success: true,
          data: userResponse
        })
      } catch (error) {
        fastify.log.error('Database error creating/updating user:', error)
        return reply.status(500).send({
          error: 'Database Error',
          message: 'Failed to create/update user',
          statusCode: 500
        })
      }

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

      const data = await database.getUserByAddress(address.toLowerCase())

      if (!data) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404
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
      const data = await database.updateUser(address.toLowerCase(), updateData)

      if (!data) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404
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

      // Get all users from database
      let allUsers = await database.getUsers()

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase()
        allUsers = allUsers.filter(user => 
          (user.nickname?.toLowerCase().includes(searchLower)) ||
          user.address.toLowerCase().includes(searchLower)
        )
      }

      // Sort by creation date (newest first)
      allUsers.sort((a, b) => b.createdAt - a.createdAt)

      // Apply pagination
      const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100 items
      const offsetNum = parseInt(offset) || 0
      
      const total = allUsers.length
      const paginatedUsers = allUsers.slice(offsetNum, offsetNum + limitNum)

      // Transform to API response format
      const users = paginatedUsers.map(transformUserToApiFormat)

      fastify.log.info(`Retrieved ${users.length} users`)

      return reply.send({
        success: true,
        data: {
          users,
          total
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

      const deleted = await database.deleteUser(address.toLowerCase())

      if (!deleted) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404
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