"use client"

import { useState, useEffect, useCallback } from 'react'
import { SupabaseAuthService, type AuthUser } from '@/lib/supabase-auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Clean up legacy storage on mount
  useEffect(() => {
    try {
      // Remove sensitive data from localStorage
      SupabaseAuthService.cleanupLegacyStorage()
      
      // Set up auth state change listener
      const { data: { subscription } } = SupabaseAuthService.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id)
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const currentUser = await SupabaseAuthService.getCurrentUser()
            setUser(currentUser)
            setError(null)
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setError(null)
          }
          
          setLoading(false)
        }
      )

      // Get initial user state
      const initializeAuth = async () => {
        try {
          const currentUser = await SupabaseAuthService.getCurrentUser()
          setUser(currentUser)
        } catch (err) {
          console.error('Auth initialization error:', err)
          setError('Failed to initialize authentication')
        } finally {
          setLoading(false)
        }
      }

      initializeAuth()

      return () => {
        subscription?.unsubscribe()
      }
    } catch (err) {
      console.error('Auth hook setup error:', err)
      setError('Authentication system error')
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await SupabaseAuthService.signIn({ email, password })
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      
      setUser(result.user)
      return { success: true, user: result.user }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, role?: 'admin' | 'user') => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await SupabaseAuthService.signUp({ email, password, role })
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      
      return { success: true, user: result.user }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await SupabaseAuthService.signOut()
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      
      setUser(null)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const isAdmin = useCallback(() => {
    return user?.role === 'admin'
  }, [user])

  const isAuthenticated = useCallback(() => {
    return user !== null
  }, [user])

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      const currentUser = await SupabaseAuthService.getCurrentUser()
      setUser(currentUser)
      setError(null)
    } catch (err) {
      console.error('Failed to refresh user:', err)
      setError('Failed to refresh user data')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isAuthenticated,
    refreshUser,
    clearError: () => setError(null)
  }
}
