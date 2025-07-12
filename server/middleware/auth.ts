/**
 * Authentication Plugin
 * 
 * Registers JWT functionality with Fastify
 */

import type { FastifyInstance } from 'fastify'
import type { AuthUser } from '../types/auth.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}

/**
 * JWT Authentication Plugin
 */
export default async function authPlugin(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    sign: {
      expiresIn: '30d',
      issuer: 'proofquest',
      audience: 'proofquest-users'
    },
    verify: {
      issuer: 'proofquest',
      audience: 'proofquest-users'
    }
  })
}