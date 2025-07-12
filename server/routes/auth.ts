/**
 * Authentication Routes
 * 
 * EVM-based authentication using Sign-In with Ethereum (SIWE)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase.js'
import { 
  verifyEVMSignature, 
  generateNonce, 
  createSiweMessage,
  normalizeAddress,
  getTokenExpiration
} from '../lib/auth.js'
import { authenticate } from '../lib/authMiddleware.js'
import type { AuthResponse } from '../types/auth.js'

// Store nonces temporarily (in production, use Redis or database)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>()

// Clean up expired nonces every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [address, data] of nonceStore.entries()) {
    if (data.expiresAt < now) {
      nonceStore.delete(address)
    }
  }
}, 5 * 60 * 1000)

export default async function authRoutes(fastify: FastifyInstance) {
  // Generate nonce for SIWE
  fastify.post('/api/auth/nonce', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any
      const address = body?.address?.toLowerCase()
      const domain = body?.domain || 'localhost:8080'
      const chainId = body?.chainId || 1

      // Validate EVM address
      if (!address || !/^0x[a-f0-9]{40}$/.test(address)) {
        return reply.code(400).send({
          error: 'Invalid Address',
          message: 'Valid EVM address is required'
        })
      }

      // Generate a new nonce
      const nonce = generateNonce()
      const expirationTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      
      // Store nonce for validation
      nonceStore.set(address, {
        nonce,
        expiresAt: expirationTime.getTime()
      })

      // Create simple SIWE message
      const message = createSiweMessage(domain, address, nonce, {
        chainId,
        expirationTime
      })

      return reply.code(200).send({
        nonce,
        message,
        domain,
        expiresAt: expirationTime.toISOString()
      })

    } catch (error: any) {
      console.error('Nonce generation error:', error)
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate nonce'
      })
    }
  })

  // Sign in with EVM signature
  fastify.post('/api/auth/signin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any
      const message = body?.message?.trim()
      const signature = body?.signature?.trim()

      if (!message || !signature) {
        return reply.code(400).send({
          error: 'Missing Data',
          message: 'Message and signature are required'
        })
      }

      // Verify signature
      const verification = await verifyEVMSignature(message, signature)
      
      if (!verification.isValid || !verification.address || !verification.parsedMessage) {
        return reply.code(401).send({
          error: 'Invalid Signature',
          message: 'Signature verification failed'
        })
      }

      const address = normalizeAddress(verification.address)
      const parsedMessage = verification.parsedMessage

      // Verify nonce
      const storedNonce = nonceStore.get(address)
      if (!storedNonce || storedNonce.nonce !== parsedMessage.nonce) {
        return reply.code(401).send({
          error: 'Invalid Nonce',
          message: 'Nonce is invalid or expired'
        })
      }

      // Check if nonce is expired
      if (storedNonce.expiresAt < Date.now()) {
        nonceStore.delete(address)
        return reply.code(401).send({
          error: 'Expired Nonce',
          message: 'Nonce has expired'
        })
      }

      // Remove used nonce
      nonceStore.delete(address)

      // Check if user exists, create if not
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('address', address)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            address,
            last_login_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('User creation error:', createError)
          return reply.code(500).send({
            error: 'Database Error',
            message: 'Failed to create user account'
          })
        }

        user = newUser
      } else if (userError) {
        console.error('User lookup error:', userError)
        return reply.code(500).send({
          error: 'Database Error',
          message: 'Failed to lookup user'
        })
      } else {
        // Update last login
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('address', address)
      }

      // Generate JWT token
      const tokenExpiration = getTokenExpiration()
      const token = fastify.jwt.sign(
        {
          address,
          iat: Math.floor(Date.now() / 1000),
          exp: tokenExpiration,
          iss: 'proofquest',
          aud: 'proofquest-users'
        },
        { expiresIn: '30d' }
      )

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          address: user.address,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          bio: user.bio
        },
        expiresAt: new Date(tokenExpiration * 1000).toISOString()
      }

      return reply.code(200).send(response)

    } catch (error: any) {
      console.error('Sign-in error:', error)
      
      if (error.name === 'ZodError') {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        })
      }

      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Authentication failed'
      })
    }
  })

  // Verify token (useful for checking if user is still authenticated)
  fastify.get('/api/auth/verify', {
    preHandler: [authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user
      
      // Get user data from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('address', user.address)
        .single()

      if (error) {
        return reply.code(404).send({
          error: 'User Not Found',
          message: 'User account not found'
        })
      }

      return reply.code(200).send({
        success: true,
        user: {
          address: userData.address,
          nickname: userData.nickname,
          avatarUrl: userData.avatar_url,
          bio: userData.bio
        },
        isAuthenticated: true
      })

    } catch (error) {
      console.error('Token verification error:', error)
      return reply.code(401).send({
        error: 'Authentication Failed',
        message: 'Invalid or expired token'
      })
    }
  })

  // Refresh token (extend expiration)
  fastify.post('/api/auth/refresh', {
    preHandler: [authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user
      
      // Generate new token with extended expiration
      const tokenExpiration = getTokenExpiration()
      const newToken = fastify.jwt.sign(
        {
          address: user.address,
          iat: Math.floor(Date.now() / 1000),
          exp: tokenExpiration,
          iss: 'proofquest',
          aud: 'proofquest-users'
        },
        { expiresIn: '30d' }
      )

      return reply.code(200).send({
        success: true,
        token: newToken,
        expiresAt: new Date(tokenExpiration * 1000).toISOString()
      })

    } catch (error) {
      console.error('Token refresh error:', error)
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to refresh token'
      })
    }
  })

  // Sign out (client-side token removal, server doesn't store tokens)
  fastify.post('/api/auth/signout', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(200).send({
      success: true,
      message: 'Signed out successfully'
    })
  })
}