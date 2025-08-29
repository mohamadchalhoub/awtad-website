"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { SupabaseAuthService, type AuthUser } from "@/lib/supabase-auth"

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check for existing authentication on mount
    const checkAuth = async () => {
      try {
        const currentUser = await SupabaseAuthService.getCurrentUser()
        setUser(currentUser)
        setIsAdmin(currentUser?.role === 'admin' || false)
      } catch (error) {
        // Auth check error
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen to auth state changes
    const { data: { subscription } } = SupabaseAuthService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await SupabaseAuthService.getCurrentUser()
          setUser(currentUser)
          setIsAdmin(currentUser?.role === 'admin' || false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAdmin(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { user, error } = await SupabaseAuthService.signIn({ email, password })
      if (user && !error) {
        setUser(user)
        setIsAdmin(user.role === 'admin')
        return true
      }
      return false
    } catch (error) {
      // Login error
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await SupabaseAuthService.signOut()
      setUser(null)
      setIsAdmin(false)
    } catch (error) {
      // Logout error
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading, isAdmin }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
