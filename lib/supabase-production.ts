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

console.log('✅ Supabase environment variables validated successfully')
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)

// Create production-optimized Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist auth in localStorage for better performance
    autoRefreshToken: false, // Disable auto refresh for better performance
    detectSessionInUrl: false, // Disable session detection for better performance
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
  },
  db: {
    schema: 'public',
  },
})

// Test connection on startup
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('🔌 Testing Supabase connection...')
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('homepage_content')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
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
    
    console.log('✅ Supabase connection test successful')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Unexpected error testing Supabase connection:', error)
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
export type { Database } from './supabase'
