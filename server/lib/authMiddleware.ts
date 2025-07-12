/**
 * Authentication Middleware Functions
 * 
 * Standalone middleware functions for JWT authentication
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import { isValidJWTPayload, isTokenExpired, extractAddressFromToken } from './auth.js'
import type { AuthUser } from '../types/auth.js'

/**
 * Authentication middleware function
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Missing Token',
        message: 'Authorization header with Bearer token is required'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Access the Fastify instance to verify JWT
    const fastify = request.server
    
    // Verify and decode token
    const decoded = await fastify.jwt.verify(token) as any
    
    // Validate payload structure
    if (!isValidJWTPayload(decoded)) {
      return reply.code(401).send({
        error: 'Invalid Token',
        message: 'Token payload is invalid'
      })
    }

    // Check if token is expired (additional check)
    if (isTokenExpired(decoded)) {
      return reply.code(401).send({
        error: 'Token Expired',
        message: 'Token has expired'
      })
    }

    // Extract user information
    const address = extractAddressFromToken(decoded)
    
    // Attach user to request
    request.user = {
      address,
      isAuthenticated: true
    }

  } catch (error: any) {
    console.error('Authentication error:', error)
    
    // Handle specific JWT errors
    if (error.code === 'FAST_JWT_INVALID_SIGNATURE') {
      return reply.code(401).send({
        error: 'Invalid Token',
        message: 'Token signature is invalid'
      })
    }
    
    if (error.code === 'FAST_JWT_EXPIRED') {
      return reply.code(401).send({
        error: 'Token Expired',
        message: 'Token has expired'
      })
    }

    if (error.code === 'FAST_JWT_MALFORMED') {
      return reply.code(401).send({
        error: 'Malformed Token',
        message: 'Token format is invalid'
      })
    }

    return reply.code(401).send({
      error: 'Authentication Failed',
      message: 'Invalid or expired token'
    })
  }
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      request.user = { address: '', isAuthenticated: false }
      return
    }

    const token = authHeader.substring(7)
    const fastify = request.server
    const decoded = await fastify.jwt.verify(token) as any
    
    if (isValidJWTPayload(decoded) && !isTokenExpired(decoded)) {
      const address = extractAddressFromToken(decoded)
      request.user = {
        address,
        isAuthenticated: true
      }
    } else {
      request.user = { address: '', isAuthenticated: false }
    }

  } catch (error) {
    // Silently fail and continue without authentication
    request.user = { address: '', isAuthenticated: false }
  }
}

/**
 * Utility to check if request is authenticated
 */
export function isAuthenticated(request: FastifyRequest): boolean {
  return request.user?.isAuthenticated === true
}

/**
 * Utility to get authenticated user address
 */
export function getAuthenticatedAddress(request: FastifyRequest): string | null {
  return isAuthenticated(request) ? request.user!.address : null
}