/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useSiweAuth, AuthService } from '@/lib/auth'
import type { AuthUser, AuthContextType } from '@/types'

// Create context
const AuthContext = createContext<AuthContextType | null>(null)

// Context provider props
interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const siweAuth = useSiweAuth()
  const authService = AuthService.getInstance()

  // Check authentication status on mount and wallet connection changes
  useEffect(() => {
    checkAuthStatus()
  }, [isConnected, address])

  /**
   * Check current authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // If wallet is not connected, clear auth state
      if (!isConnected || !address) {
        setUser(null)
        authService.signOut()
        return
      }

      // Check if we have a valid token
      const currentToken = authService.getCurrentToken()
      if (!currentToken || !authService.isAuthenticated()) {
        setUser(null)
        return
      }

      // Verify token with backend
      const verifiedUser = await authService.verifyToken()
      if (verifiedUser) {
        setUser(verifiedUser)
      } else {
        setUser(null)
        authService.signOut()
      }
    } catch (error: any) {
      console.error('Auth status check failed:', error)
      setError(error.message || 'Authentication check failed')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, authService])

  /**
   * Sign in with SIWE
   */
  const signIn = useCallback(async (walletAddress: string) => {
    if (!isConnected || address?.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Wallet address mismatch')
    }

    setIsLoading(true)
    setError(null)

    try {
      const { user: authenticatedUser, token } = await siweAuth.authenticate()
      setUser(authenticatedUser)
      setError(null)
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed'
      setError(errorMessage)
      setUser(null)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, siweAuth])

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await siweAuth.signOut()
      setUser(null)
    } catch (error: any) {
      console.error('Sign out failed:', error)
      setError(error.message || 'Sign out failed')
    } finally {
      setIsLoading(false)
    }
  }, [siweAuth])

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async () => {
    if (!isConnected || !user) {
      return
    }

    try {
      const result = await authService.refreshToken()
      if (result) {
        setUser(result.user)
      } else {
        setUser(null)
        signOut()
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error)
      setError(error.message || 'Token refresh failed')
      signOut()
    }
  }, [isConnected, user, authService, signOut])

  // Auto-refresh token before expiration (disabled for now to debug)
  useEffect(() => {
    if (!user || !authService.isAuthenticated()) {
      return
    }

    // Debug: Log token info but don't auto-refresh
    const token = authService.getCurrentToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expirationTime = payload.exp * 1000
        const timeUntilExpiration = expirationTime - Date.now()

        console.log('Token info:', {
          exp: payload.exp,
          expirationTime: new Date(expirationTime),
          timeUntilExpiration: Math.round(timeUntilExpiration / 1000 / 60 / 60), // hours
          isValid: timeUntilExpiration > 0
        })
      } catch (error) {
        console.error('Token parsing error:', error)
      }
    }
  }, [user, authService])

  // Context value
  const contextValue: AuthContextType = {
    user,
    token: authService.getCurrentToken(),
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    error,
    signIn,
    signOut,
    refreshToken
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Hook to require authentication
 */
export function useRequireAuth(): AuthContextType {
  const auth = useAuth()
  
  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error('Authentication required')
  }
  
  return auth
}

export default AuthContext