"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function SupabaseTest() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setStatus('Testing connection...')
    
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('projects')
        .select('count')
        .limit(1)
      
      if (error) {
        setStatus(`❌ Connection failed: ${error.message}`)
      } else {
        setStatus('✅ Supabase connection successful!')
      }
    } catch (err) {
      setStatus(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testInsert = async () => {
    setLoading(true)
    setStatus('Testing insert...')
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: 'Test Project',
          category: 'Test',
          description: 'This is a test project',
          year: '2024'
        })
        .select()
      
      if (error) {
        setStatus(`❌ Insert failed: ${error.message}`)
      } else {
        setStatus('✅ Test project created successfully!')
        
        // Clean up test data
        if (data?.[0]?.id) {
          await supabase
            .from('projects')
            .delete()
            .eq('id', data[0].id)
        }
      }
    } catch (err) {
      setStatus(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Supabase Connection Test</h3>
      
      <div className="space-x-2">
        <Button 
          onClick={testConnection} 
          disabled={loading}
          variant="outline"
        >
          Test Connection
        </Button>
        
        <Button 
          onClick={testInsert} 
          disabled={loading}
          variant="outline"
        >
          Test Insert
        </Button>
      </div>
      
      <div className="text-sm">
        <strong>Status:</strong> {status}
      </div>
      
      <div className="text-xs text-muted-foreground">
        Make sure you have set up your .env.local file with Supabase credentials.
      </div>
    </div>
  )
}

