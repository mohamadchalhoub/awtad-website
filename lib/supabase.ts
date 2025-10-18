import { createClient } from '@supabase/supabase-js'

// Production-ready Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    ❌ CRITICAL: Missing Supabase environment variables!
    
    Required:
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    Current values:
    - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'MISSING'}
    
    Please create a .env.local file with your Supabase credentials.
    This error will prevent the app from working in production.
  `)
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error(`
    ❌ INVALID: NEXT_PUBLIC_SUPABASE_URL format is incorrect!
    
    Expected format: https://[project-id].supabase.co
    Current value: ${supabaseUrl}
    
    Please check your Supabase project URL.
  `)
}

// Validate API key format (JWT tokens are long)
if (supabaseAnonKey.length < 100) {
  throw new Error(`
    ❌ INVALID: NEXT_PUBLIC_SUPABASE_ANON_KEY format is incorrect!
    
    Expected: Long JWT token (100+ characters)
    Current length: ${supabaseAnonKey.length}
    
    Please check your Supabase anon key.
  `)
}

// Create production-optimized Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable persistent localStorage storage for security
    autoRefreshToken: true, // Enable auto refresh for better UX
    detectSessionInUrl: true, // Enable session detection for auth flows
    storage: {
      // Use custom storage that's more secure
      getItem: (key: string) => {
        try {
          // Only allow access to non-sensitive keys
          if (key.includes('auth') || key.includes('token')) {
            return null // Block access to sensitive auth data
          }
          return sessionStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          // Only allow setting non-sensitive keys
          if (key.includes('auth') || key.includes('token')) {
            return // Block setting sensitive auth data
          }
          sessionStorage.setItem(key, value)
        } catch {
          // Silently fail if storage is not available
        }
      },
      removeItem: (key: string) => {
        try {
          sessionStorage.removeItem(key)
        } catch {
          // Silently fail if storage is not available
        }
      }
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 1, // Limit realtime events for production
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'awtad-website-production',
      'X-Client-Version': '1.0.0',
    },
    // Add 30 second timeout for all queries (increased for complex joined queries)
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        // Add keep-alive for connection reuse
        keepalive: true,
      }).finally(() => clearTimeout(timeoutId))
    },
  },
  db: {
    schema: 'public',
  },
})

// Test connection on startup
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('homepage_content')
      .select('count')
      .limit(1)
    
    if (error) {
      return {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      }
    }
    
    return { success: true }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    }
  }
}

// Production-ready error handler
export function handleSupabaseError(error: any, operation: string): never {
  console.error(`❌ Supabase ${operation} failed:`, error)
  
  const errorMessage = error?.message || 'Unknown database error'
  const errorCode = error?.code || 'UNKNOWN'
  
  // Log detailed error for debugging
  console.error('Error details:', {
    operation,
    code: errorCode,
    message: errorMessage,
    details: error?.details,
    hint: error?.hint,
    timestamp: new Date().toISOString()
  })
  
  // Throw a user-friendly error
  throw new Error(`Database operation failed: ${errorMessage} (Code: ${errorCode})`)
}

// Export types for use in other files
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: number
          title: string
          category: string
          description: string
          year: string
          cover_image_id: string | null
          parent_id: number | null
          created_at: string
          updated_at: string
          created_by: string | null
          is_active: boolean
          featured: boolean
        }
        Insert: {
          id?: number
          title: string
          category: string
          description: string
          year: string
          cover_image_id?: string | null
          parent_id?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          is_active?: boolean
          featured?: boolean
        }
        Update: {
          id?: number
          title?: string
          category?: string
          description?: string
          year?: string
          cover_image_id?: string | null
          parent_id?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          is_active?: boolean
          featured?: boolean
        }
      }
      images: {
        Row: {
          id: string
          name: string
          url: string
          category: string
          project_id: number | null
          upload_date: string
          file_size: number
          mime_type: string | null
          alt_text: string | null
          is_cover_image: boolean
          created_by: string | null
          created_at: string
          price: number
        }
        Insert: {
          id?: string
          name: string
          url: string
          category: string
          project_id?: number | null
          upload_date?: string
          file_size: number
          mime_type?: string | null
          alt_text?: string | null
          is_cover_image?: boolean
          created_by?: string | null
          created_at?: string
          price?: number
        }
        Update: {
          id?: string
          name?: string
          url?: string
          category?: string
          project_id?: number | null
          upload_date?: string
          file_size?: number
          mime_type?: string | null
          alt_text?: string | null
          is_cover_image?: boolean
          created_by?: string | null
          created_at?: string
          price?: number
        }
      }
      homepage_content: {
        Row: {
          id: number
          section_name: string
          title: string | null
          subtitle: string | null
          description: string | null
          content: any
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: number
          section_name: string
          title?: string | null
          subtitle?: string | null
          description?: string | null
          content?: any
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: number
          section_name?: string
          title?: string | null
          subtitle?: string | null
          description?: string | null
          content?: any
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
      }
      about_content: {
        Row: {
          id: number
          section_name: string
          title: string | null
          content: string | null
          additional_data: any
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: number
          section_name: string
          title?: string | null
          content?: string | null
          additional_data?: any
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: number
          section_name?: string
          title?: string | null
          content?: string | null
          additional_data?: any
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          color: string | null
          icon: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          created_at?: string
          is_active?: boolean
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
