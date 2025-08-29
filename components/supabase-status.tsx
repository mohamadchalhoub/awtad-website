"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function SupabaseStatus() {
  const [status, setStatus] = useState<string>('Checking...')
  const [loading, setLoading] = useState(true)
  const [envVars, setEnvVars] = useState<{ url: string; key: string }>({ url: '', key: '' })

  useEffect(() => {
    checkConnection()
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setEnvVars({
      url: url || 'NOT SET',
      key: key ? `${key.substring(0, 20)}...` : 'NOT SET'
    })
    
    // Log environment variable status
    if (!url || !key) {
              // Missing Supabase environment variables
    } else {
              // Supabase environment variables are set
    }
  }

  const checkConnection = async () => {
    try {
      setLoading(true)
      setStatus('Testing connection...')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('projects')
        .select('count')
        .limit(1)
      
      if (error) {
        setStatus(`❌ Connection failed: ${error.message}`)
      } else {
        setStatus('✅ Connection successful!')
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Supabase Connection Status</h3>
      <div className="space-y-3">
        <div className="text-sm">
          <p><strong>URL:</strong> {envVars.url}</p>
          <p><strong>Key:</strong> {envVars.key}</p>
        </div>
        <div className="text-sm">
          <p><strong>Status:</strong> {status}</p>
        </div>
        <Button 
          onClick={checkConnection} 
          disabled={loading} 
          variant="outline" 
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </Button>
      </div>
    </div>
  )
}
