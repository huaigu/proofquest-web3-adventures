/**
 * Authentication Validation Schemas
 * 
 * Zod validation schemas for authentication endpoints
 */

import { z } from 'zod'

// EVM address validation regex
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

// SIWE message validation
export const SiweMessageSchema = z.object({
  domain: z.string().min(1),
  address: z.string().regex(EVM_ADDRESS_REGEX, 'Invalid EVM address format'),
  statement: z.string().optional(),
  uri: z.string().url(),
  version: z.string(),
  chainId: z.number().int().positive(),
  nonce: z.string().min(1),
  issuedAt: z.string().datetime(),
  expirationTime: z.string().datetime().optional(),
  notBefore: z.string().datetime().optional(),
  requestId: z.string().optional(),
  resources: z.array(z.string()).optional()
})

// Authentication request validation
export const AuthRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  signature: z.string().min(1, 'Signature is required')
})

// Nonce request validation
export const NonceRequestSchema = z.object({
  address: z.string().regex(EVM_ADDRESS_REGEX, 'Invalid EVM address format'),
  domain: z.string().min(1, 'Domain is required').optional(),
  chainId: z.number().int().positive().optional()
})

// JWT payload validation
export const JWTPayloadSchema = z.object({
  address: z.string().regex(EVM_ADDRESS_REGEX, 'Invalid EVM address format'),
  iat: z.number().int(),
  exp: z.number().int(),
  iss: z.string(),
  aud: z.string()
})

// Response schemas
export const AuthResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  user: z.object({
    address: z.string(),
    nickname: z.string().optional(),
    avatarUrl: z.string().optional(),
    bio: z.string().optional()
  }).optional(),
  expiresAt: z.string().optional(),
  message: z.string().optional()
})

export const NonceResponseSchema = z.object({
  nonce: z.string(),
  message: z.string(),
  domain: z.string(),
  expiresAt: z.string()
})

// Validation helper functions
export function validateAuthRequest(data: unknown) {
  return AuthRequestSchema.parse(data)
}

export function validateNonceRequest(data: unknown) {
  return NonceRequestSchema.parse(data)
}

export function validateJWTPayload(data: unknown) {
  return JWTPayloadSchema.parse(data)
}

// Transform functions
export function transformAuthRequest(data: any) {
  const parsed = validateAuthRequest(data)
  return {
    message: parsed.message.trim(),
    signature: parsed.signature.trim()
  }
}

export function transformNonceRequest(data: any) {
  const parsed = validateNonceRequest(data)
  return {
    address: parsed.address.toLowerCase(),
    domain: parsed.domain || 'localhost:3001',
    chainId: parsed.chainId || 1
  }
}