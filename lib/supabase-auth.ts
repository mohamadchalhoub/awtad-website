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
  private static readonly STORAGE_KEY = "awtad_auth_user"

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

      // Store user in localStorage for persistence
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser))

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
      
      // Clear local storage
      localStorage.removeItem(this.STORAGE_KEY)
      
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
      // First check localStorage for cached user
      const cachedUser = localStorage.getItem(this.STORAGE_KEY)
      if (cachedUser) {
        return JSON.parse(cachedUser)
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

      // Cache the user
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser))

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
}
