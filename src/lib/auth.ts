/**
 * Authentication Utilities
 * 
 * SIWE authentication integration with RainbowKit and backend API
 */

import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import apiClient from './api'
import type { AuthUser, NonceRequest, SignInRequest } from '@/types'

/**
 * SIWE Authentication Service
 */
export class AuthService {
  private static instance: AuthService
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Request nonce for SIWE message
   */
  async requestNonce(address: string): Promise<{ nonce: string; message: string }> {
    const request: NonceRequest = {
      address: address, // Send the address as-is, backend will normalize it
      domain: window.location.host,
      chainId: 10143 // Monad testnet
    }
    
    const response = await apiClient.requestNonce(request)
    return {
      nonce: response.nonce,
      message: response.message
    }
  }

  /**
   * Sign in with SIWE signature
   */
  async signIn(message: string, signature: string): Promise<{ user: AuthUser; token: string }> {
    const request: SignInRequest = {
      message,
      signature
    }
    
    const response = await apiClient.signIn(request)
    
    if (!response.success || !response.token || !response.user) {
      throw new Error(response.message || 'Authentication failed')
    }
    
    return {
      user: response.user,
      token: response.token
    }
  }

  /**
   * Verify existing token
   */
  async verifyToken(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.verifyToken()
      return response.success && response.user ? response.user : null
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const response = await apiClient.refreshToken()
      if (response.success && response.token && response.user) {
        return {
          user: response.user,
          token: response.token
        }
      }
      return null
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await apiClient.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  /**
   * Get current token from storage
   */
  getCurrentToken(): string | null {
    return apiClient.getToken()
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getCurrentToken()
    if (!token) return false
    
    try {
      // Basic JWT token validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp > now
    } catch {
      return false
    }
  }
}

/**
 * Hook for SIWE authentication with RainbowKit
 */
export function useSiweAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { disconnect } = useDisconnect()
  
  const authService = AuthService.getInstance()

  /**
   * Authenticate with SIWE
   */
  const authenticate = async (): Promise<{ user: AuthUser; token: string }> => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      // Step 1: Request nonce
      const { message } = await authService.requestNonce(address)
      
      // Step 2: Sign message with wallet
      const signature = await signMessageAsync({ message })
      
      // Step 3: Authenticate with backend
      const result = await authService.signIn(message, signature)
      
      return result
    } catch (error: any) {
      console.error('Authentication failed:', error)
      throw new Error(error.message || 'Authentication failed')
    }
  }

  /**
   * Sign out and disconnect wallet
   */
  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut()
    } finally {
      disconnect()
    }
  }

  /**
   * Verify current authentication status
   */
  const verifyAuth = async (): Promise<AuthUser | null> => {
    if (!isConnected || !address) {
      return null
    }
    
    return authService.verifyToken()
  }

  return {
    authenticate,
    signOut,
    verifyAuth,
    isWalletConnected: isConnected,
    walletAddress: address,
    isAuthenticated: authService.isAuthenticated()
  }
}

/**
 * Token storage utilities
 */
export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem('auth_token')
    } catch {
      return null
    }
  },
  
  set: (token: string): void => {
    try {
      localStorage.setItem('auth_token', token)
    } catch (error) {
      console.error('Failed to store token:', error)
    }
  },
  
  remove: (): void => {
    try {
      localStorage.removeItem('auth_token')
    } catch (error) {
      console.error('Failed to remove token:', error)
    }
  },
  
  isValid: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp > now
    } catch {
      return false
    }
  }
}

export default AuthService