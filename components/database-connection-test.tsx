"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { SupabaseContentService } from '@/lib/supabase-content'

export function DatabaseConnectionTest() {
  const [testResults, setTestResults] = useState<Array<{test: string, status: string, message: string}>>([])
  const [loading, setLoading] = useState(false)
  const [envStatus, setEnvStatus] = useState<Record<string, {exists: boolean, value: string, fullValue: string | undefined}>>({})

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setEnvStatus({
      url: {
        exists: !!url,
        value: url ? `${url.substring(0, 20)}...` : 'MISSING',
        fullValue: url
      },
      key: {
        exists: !!key,
        value: key ? `${key.substring(0, 20)}...` : 'MISSING',
        fullValue: key
      }
    })
  }

  const runConnectionTests = async () => {
    setLoading(true)
    setTestResults([])
    
    const results: Array<{test: string, status: string, message: string}> = []

    // Test 1: Basic Supabase client creation
    try {
      results.push({
        test: 'Supabase Client Creation',
        status: 'running',
        message: 'Testing...'
      })
      setTestResults([...results])

      const testClient = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      results[results.length - 1] = {
        test: 'Supabase Client Creation',
        status: 'success',
        message: 'Client created successfully'
      }
      setTestResults([...results])
    } catch (error) {
      results[results.length - 1] = {
        test: 'Supabase Client Creation',
        status: 'error',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
      setTestResults([...results])
      setLoading(false)
      return
    }

    // Test 2: Basic connection test
    try {
      results.push({
        test: 'Basic Connection Test',
        status: 'running',
        message: 'Testing...'
      })
      setTestResults([...results])

      const { data, error } = await supabase
        .from('homepage_content')
        .select('count')
        .limit(1)

      if (error) {
        results[results.length - 1] = {
          test: 'Basic Connection Test',
          status: 'error',
          message: `Database error: ${error.message} (Code: ${error.code})`
        }
      } else {
        results[results.length - 1] = {
          test: 'Basic Connection Test',
          status: 'success',
          message: `Connected successfully. Count: ${data?.[0]?.count || 'N/A'}`
        }
      }
      setTestResults([...results])
    } catch (error) {
      results[results.length - 1] = {
        test: 'Basic Connection Test',
        status: 'error',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
      setTestResults([...results])
    }

    // Test 3: Test each table individually
    const tables = ['homepage_content', 'about_content', 'projects', 'images', 'categories']
    
    for (const table of tables) {
      try {
        results.push({
          test: `Table Access: ${table}`,
          status: 'running',
          message: 'Testing...'
        })
        setTestResults([...results])

        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          results[results.length - 1] = {
            test: `Table Access: ${table}`,
            status: 'error',
            message: `Access denied: ${error.message} (Code: ${error.code})`
          }
        } else {
          results[results.length - 1] = {
            test: `Table Access: ${table}`,
            status: 'success',
            message: `Access granted. Rows: ${data?.length || 0}`
          }
        }
        setTestResults([...results])
      } catch (error) {
        results[results.length - 1] = {
          test: `Table Access: ${table}`,
          status: 'error',
          message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
        setTestResults([...results])
      }
    }

    // Test 4: Test insert operation
    try {
      results.push({
        test: 'Test Insert Operation',
        status: 'running',
        message: 'Testing...'
      })
      setTestResults([...results])

      const testData = {
        section_name: `test_connection_${Date.now()}`, // Make it unique
        title: 'Test Title',
        content: 'Test content for connection testing'
      }

      const { data, error } = await supabase
        .from('homepage_content')
        .insert(testData)
        .select()

      if (error) {
        results[results.length - 1] = {
          test: 'Test Insert Operation',
          status: 'error',
          message: `Insert failed: ${error.message} (Code: ${error.code})`
        }
      } else {
        // Clean up test data
        await supabase
          .from('homepage_content')
          .delete()
          .eq('section_name', testData.section_name)

        results[results.length - 1] = {
          test: 'Test Insert Operation',
          status: 'success',
          message: 'Insert and delete operations successful'
        }
      }
      setTestResults([...results])
    } catch (error) {
      results[results.length - 1] = {
        test: 'Test Insert Operation',
        status: 'error',
        message: `Insert test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
      setTestResults([...results])
    }

    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'running': return '⏳'
      default: return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'running': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔌 Database Connection Test
          <Button 
            onClick={runConnectionTests}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? 'Running Tests...' : 'Run Connection Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Variables Status */}
        <div className="space-y-3">
          <h4 className="font-semibold">Environment Variables Status:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
              <div className={`font-mono ${envStatus.url?.exists ? 'text-green-600' : 'text-red-600'}`}>
                {envStatus.url?.value}
              </div>
            </div>
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
              <div className={`font-mono ${envStatus.key?.exists ? 'text-green-600' : 'text-red-600'}`}>
                {envStatus.key?.value}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Connection Test Results:</h4>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={getStatusColor(result.status)}>
                    {getStatusIcon(result.status)}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {testResults.some(r => r.status === 'error') && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h5 className="font-semibold text-red-800 mb-2">🚨 Connection Issues Detected</h5>
            <div className="text-red-700 text-sm space-y-2">
              <p><strong>Common Solutions:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify your Supabase project URL and API key are correct</li>
                <li>Check if your Supabase project is active and not paused</li>
                <li>Ensure RLS policies allow anonymous access to tables</li>
                <li>Verify the tables exist in your database</li>
                <li>Check if your IP is not blocked by Supabase</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to create Supabase client
async function createClient(url: string, key: string) {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  return createSupabaseClient(url, key)
}
