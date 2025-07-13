/**
 * Authentication Hooks
 * 
 * Additional hooks for authentication functionality
 */

import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

/**
 * Hook for handling authentication flow with UI feedback
 */
export function useAuthFlow() {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { isConnected, address } = useAccount()
  const { signIn, signOut, isAuthenticated, user, error } = useAuth()
  const { toast } = useToast()

  /**
   * Handle sign in with error handling and UI feedback
   */
  const handleSignIn = useCallback(async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return false
    }

    if (isAuthenticated) {
      toast({
        title: "Already Authenticated",
        description: "You are already signed in",
        variant: "default"
      })
      return true
    }

    setIsAuthenticating(true)

    try {
      await signIn(address)
      
      toast({
        title: "Authentication Successful",
        description: "You have been signed in successfully",
        variant: "default"
      })
      
      return true
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to authenticate with wallet",
        variant: "destructive"
      })
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }, [isConnected, address, isAuthenticated, signIn, toast])

  /**
   * Handle sign out with UI feedback
   */
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
        variant: "default"
      })
      
      return true
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message || "Failed to sign out",
        variant: "destructive"
      })
      return false
    }
  }, [signOut, toast])

  return {
    isAuthenticating,
    isAuthenticated,
    user,
    error,
    handleSignIn,
    handleSignOut,
    isWalletConnected: isConnected,
    walletAddress: address
  }
}

/**
 * Hook for protected actions that require authentication
 */
export function useProtectedAction() {
  const { isAuthenticated, isLoading } = useAuth()
  const { handleSignIn } = useAuthFlow()
  const { toast } = useToast()

  /**
   * Execute an action that requires authentication
   */
  const executeProtected = useCallback(async <T>(
    action: () => Promise<T>,
    options?: {
      requireAuth?: boolean
      onUnauthenticated?: () => void
      errorMessage?: string
    }
  ): Promise<T | null> => {
    const {
      requireAuth = true,
      onUnauthenticated,
      errorMessage = "Authentication required for this action"
    } = options || {}

    // Check if authentication is required
    if (requireAuth && !isAuthenticated && !isLoading) {
      if (onUnauthenticated) {
        onUnauthenticated()
      } else {
        toast({
          title: "Authentication Required",
          description: errorMessage,
          variant: "destructive"
        })
        
        // Attempt to authenticate
        const authenticated = await handleSignIn()
        if (!authenticated) {
          return null
        }
      }
    }

    // Execute the action
    try {
      return await action()
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "An error occurred",
        variant: "destructive"
      })
      throw error
    }
  }, [isAuthenticated, isLoading, handleSignIn, toast])

  return {
    executeProtected,
    isAuthenticated,
    isLoading
  }
}

/**
 * Hook for handling authentication-dependent UI states
 */
export function useAuthUI() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { isConnected, address } = useAccount()
  const { handleSignIn, handleSignOut, isAuthenticating } = useAuthFlow()

  // Determine UI state
  const getAuthButtonState = () => {
    if (isLoading || isAuthenticating) {
      return {
        text: 'Loading...',
        disabled: true,
        variant: 'outline' as const
      }
    }

    if (!isConnected) {
      return {
        text: 'Connect Wallet',
        disabled: false,
        variant: 'default' as const,
        action: undefined // Handled by RainbowKit
      }
    }

    if (!isAuthenticated) {
      return {
        text: 'Sign In',
        disabled: false,
        variant: 'default' as const,
        action: handleSignIn
      }
    }

    return {
      text: 'Sign Out',
      disabled: false,
      variant: 'outline' as const,
      action: handleSignOut
    }
  }

  // Format user display name
  const getUserDisplayName = () => {
    if (!user) return null
    
    if (user.nickname) {
      return user.nickname
    }
    
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    
    return 'Unknown User'
  }

  return {
    authButtonState: getAuthButtonState(),
    userDisplayName: getUserDisplayName(),
    isAuthenticated,
    isLoading: isLoading || isAuthenticating,
    user,
    walletAddress: address,
    isWalletConnected: isConnected
  }
}

export default useAuthFlow