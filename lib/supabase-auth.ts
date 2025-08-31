import { supabase } from './supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  role?: 'admin' | 'user'
}

export class SupabaseAuthService {
  private static readonly USER_CACHE_KEY = "awtad_user_cache"
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  private static sessionTimer: NodeJS.Timeout | null = null

  /**
   * Sign in with email and password
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'No user data received' }
      }

      // Get or create user profile
      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email!,
            role: 'user'
          })
          .select('role')
          .single()
        
        if (createError) {
          console.warn('Profile creation error:', createError)
        } else {
          profile = newProfile
        }
      } else if (profileError) {
        console.warn('Profile fetch error:', profileError)
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: profile?.role || 'user',
        created_at: data.user.created_at,
      }

      // Store minimal user data in sessionStorage (cleared when browser closes)
      this.setSecureUserCache(authUser)
      
      // Set session timeout
      this.setSessionTimeout()

      return { user: authUser, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign up new user
   */
  static async signUp(credentials: SignUpCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'No user data received' }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          role: credentials.role || 'user',
        })

      if (profileError) {
        console.warn('Profile creation error:', profileError)
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: credentials.role || 'user',
        created_at: data.user.created_at,
      }

      return { user: authUser, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      // Clear secure cache
      this.clearSecureUserCache()
      
      // Clear session timeout
      this.clearSessionTimeout()
      
      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First check secure cache
      const cachedUser = this.getSecureUserCache()
      if (cachedUser) {
        return cachedUser
      }

      // If no cached user, check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        return null
      }

      // Get or create user profile
      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: session.user.id,
            email: session.user.email!,
            role: 'user'
          })
          .select('role')
          .single()
        
        if (createError) {
          console.warn('Profile creation error:', createError)
        } else {
          profile = newProfile
        }
      } else if (profileError) {
        console.warn('Profile fetch error:', profileError)
      }

      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        role: profile?.role || 'user',
        created_at: session.user.created_at,
      }

      // Cache the user securely
      this.setSecureUserCache(authUser)
      
      // Set session timeout
      this.setSessionTimeout()

      return authUser
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.role === 'admin'
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Secure user cache management using sessionStorage
   */
  private static setSecureUserCache(user: AuthUser): void {
    try {
      // Store minimal user data without sensitive information
      const secureUserData = {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        cached_at: Date.now()
      }
      
      sessionStorage.setItem(this.USER_CACHE_KEY, JSON.stringify(secureUserData))
    } catch (error) {
      console.warn('Failed to cache user data:', error)
    }
  }

  private static getSecureUserCache(): AuthUser | null {
    try {
      const cached = sessionStorage.getItem(this.USER_CACHE_KEY)
      if (!cached) return null

      const userData = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() - userData.cached_at > this.SESSION_TIMEOUT) {
        this.clearSecureUserCache()
        return null
      }

      return {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        created_at: userData.created_at
      }
    } catch (error) {
      console.warn('Failed to retrieve cached user data:', error)
      this.clearSecureUserCache()
      return null
    }
  }

  private static clearSecureUserCache(): void {
    try {
      sessionStorage.removeItem(this.USER_CACHE_KEY)
    } catch (error) {
      console.warn('Failed to clear user cache:', error)
    }
  }

  /**
   * Session timeout management
   */
  private static setSessionTimeout(): void {
    this.clearSessionTimeout()
    
    this.sessionTimer = setTimeout(() => {
      console.log('Session timeout reached, clearing user data')
      this.clearSecureUserCache()
      // Optionally trigger a re-authentication flow
    }, this.SESSION_TIMEOUT)
  }

  private static clearSessionTimeout(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
      this.sessionTimer = null
    }
  }

  /**
   * Clean up any existing localStorage data (migration helper)
   */
  static cleanupLegacyStorage(): void {
    try {
      // Remove old localStorage items
      localStorage.removeItem("awtad_auth_user")
      
      // Remove any Supabase auth tokens from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('sb-') || key.includes('auth') || key.includes('token')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to cleanup legacy storage:', error)
    }
  }
}
