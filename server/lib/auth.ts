/**
 * Authentication Utilities
 * 
 * EVM signature verification and JWT token management
 */

import { SiweMessage } from 'siwe'
import { ethers } from 'ethers'
import type { 
  AuthRequest, 
  AuthResponse, 
  JWTPayload, 
  InvalidSignatureError,
  ExpiredTokenError,
  InvalidTokenError 
} from '../types/auth.js'

/**
 * Verify EVM signature using Sign-In with Ethereum (SIWE)
 */
export async function verifyEVMSignature(
  message: string, 
  signature: string
): Promise<{ isValid: boolean; address?: string; parsedMessage?: SiweMessage }> {
  try {
    // Parse the SIWE message
    const siweMessage = new SiweMessage(message)
    
    // Verify the signature
    const result = await siweMessage.verify({ signature })
    
    if (result.success) {
      return {
        isValid: true,
        address: siweMessage.address.toLowerCase(),
        parsedMessage: siweMessage
      }
    }
    
    return { isValid: false }
  } catch (error) {
    console.error('Signature verification error:', error)
    return { isValid: false }
  }
}

/**
 * Verify EVM address format
 */
export function isValidEVMAddress(address: string): boolean {
  return ethers.isAddress(address)
}

/**
 * Normalize EVM address to lowercase
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase()
}

/**
 * Generate a random nonce for SIWE messages
 */
export function generateNonce(): string {
  return ethers.hexlify(ethers.randomBytes(16))
}

/**
 * Create a simple, fixed SIWE message
 */
export function createSiweMessage(
  domain: string,
  address: string,
  nonce: string,
  options: {
    chainId?: number
    expirationTime?: Date
  } = {}
): string {
  const {
    chainId = 1,
    expirationTime
  } = options

  const siweMessage = new SiweMessage({
    domain,
    address,
    statement: 'Please sign this message to authenticate with ProofQuest.',
    uri: `https://${domain}`,
    version: '1',
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
    ...(expirationTime && { expirationTime: expirationTime.toISOString() })
  })

  return siweMessage.prepareMessage()
}

/**
 * Validate JWT payload structure
 */
export function isValidJWTPayload(payload: any): payload is JWTPayload {
  return (
    payload &&
    typeof payload.address === 'string' &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number' &&
    typeof payload.iss === 'string' &&
    typeof payload.aud === 'string' &&
    isValidEVMAddress(payload.address)
  )
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now
}

/**
 * Calculate token expiration time (30 days from now)
 */
export function getTokenExpiration(): number {
  const thirtyDays = 30 * 24 * 60 * 60 // 30 days in seconds
  return Math.floor(Date.now() / 1000) + thirtyDays
}

/**
 * Extract address from JWT payload
 */
export function extractAddressFromToken(payload: JWTPayload): string {
  return normalizeAddress(payload.address)
}