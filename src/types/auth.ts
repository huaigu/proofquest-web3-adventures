/**
 * Authentication Types
 * 
 * Types for SIWE authentication and JWT token management
 */

// SIWE Message
export interface SiweMessage {
  domain: string
  address: string
  statement: string
  uri: string
  version: string
  chainId: number
  nonce: string
  issuedAt: string
  expirationTime?: string
}

// Authentication Request/Response
export interface NonceRequest {
  address: string
  domain?: string
  chainId?: number
}

export interface NonceResponse {
  nonce: string
  message: string
  domain: string
  expiresAt: string
}

export interface SignInRequest {
  message: string
  signature: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: AuthUser
  expiresAt?: string
  message?: string
}

// User Types
export interface AuthUser {
  address: string
  nickname?: string
  avatarUrl?: string
  bio?: string
}

// JWT Payload
export interface JWTPayload {
  address: string
  iat: number
  exp: number
  iss: string
  aud: string
}

// Authentication Context
export interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signIn: (address: string) => Promise<void>
  signOut: () => void
  refreshToken: () => Promise<void>
}

// Authentication Errors
export class AuthError extends Error {
  code: string
  
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export class InvalidSignatureError extends AuthError {
  constructor(message: string = 'Invalid signature') {
    super(message, 'INVALID_SIGNATURE')
  }
}

export class ExpiredTokenError extends AuthError {
  constructor(message: string = 'Token has expired') {
    super(message, 'EXPIRED_TOKEN')
  }
}