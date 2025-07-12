/**
 * Authentication Types
 * 
 * Types for EVM-based authentication using Sign-In with Ethereum (SIWE)
 */

export interface SiweMessage {
  domain: string
  address: string
  statement?: string
  uri: string
  version: string
  chainId: number
  nonce: string
  issuedAt: string
  expirationTime?: string
  notBefore?: string
  requestId?: string
  resources?: string[]
}

export interface AuthRequest {
  message: string
  signature: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    address: string
    nickname?: string
    avatarUrl?: string
    bio?: string
  }
  expiresAt?: string
  message?: string
}

export interface JWTPayload {
  address: string
  iat: number
  exp: number
  iss: string
  aud: string
}

export interface AuthUser {
  address: string
  nickname?: string
  avatarUrl?: string
  bio?: string
  isAuthenticated: boolean
}

// Authentication errors
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class InvalidSignatureError extends AuthError {
  constructor(message: string = 'Invalid signature') {
    super(message, 'INVALID_SIGNATURE', 401)
  }
}

export class ExpiredTokenError extends AuthError {
  constructor(message: string = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED', 401)
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message: string = 'Invalid token') {
    super(message, 'INVALID_TOKEN', 401)
  }
}

export class MissingTokenError extends AuthError {
  constructor(message: string = 'Missing authentication token') {
    super(message, 'MISSING_TOKEN', 401)
  }
}