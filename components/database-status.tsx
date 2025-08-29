"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DatabaseStatus() {
  const [status, setStatus] = useState<string>('Checking...')
  const [loading, setLoading] = useState(true)
  const [tableStatus, setTableStatus] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      setStatus('Testing database connection...')

      // Test basic connection using direct supabase client
      const { data, error } = await supabase
        .from('homepage_content')
        .select('count')
        .limit(1)
      
      if (error) {
        throw new Error(`Connection failed: ${error.message}`)
      }

      setStatus('Connection successful! Testing tables...')

      // Test each table
      const tables = ['projects', 'images', 'homepage_content', 'about_content', 'categories']
      const tableResults: Record<string, boolean> = {}

      for (const table of tables) {
        try {
          // Testing table
          const { data: tableData, error: tableError } = await supabase.from(table).select('count').limit(1)
                      // Table result
          tableResults[table] = !tableError
        } catch (err) {
                      // Table error
          tableResults[table] = false
        }
      }
      
              // Final table results

      setTableStatus(tableResults)
      setStatus('Database check completed!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Database check failed')
    } finally {
      setLoading(false)
    }
  }

  const getTableStatusIcon = (exists: boolean) => exists ? '✅' : '❌'
  const getTableStatusColor = (exists: boolean) => exists ? 'text-green-600' : 'text-red-600'

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗄️ Database Status
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkDatabaseStatus}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p><strong>Status:</strong> {status}</p>
          {error && (
            <p className="text-red-600 mt-2">
              <strong>Error:</strong> {error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Table Status:</h4>
          {Object.entries(tableStatus).map(([table, exists]) => (
            <div key={table} className="flex items-center gap-2 text-sm">
              <span className={getTableStatusColor(exists)}>
                {getTableStatusIcon(exists)}
              </span>
              <span className="font-mono">{table}</span>
              <span className={getTableStatusColor(exists)}>
                {exists ? 'Available' : 'Missing'}
              </span>
            </div>
          ))}
        </div>

        {Object.values(tableStatus).some(exists => !exists) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Missing Tables</h5>
            <p className="text-yellow-700 text-sm mb-2">
              Some required tables are missing. Please run the setup script in your Supabase SQL Editor:
            </p>
            <code className="text-xs bg-yellow-100 p-2 rounded block">
              scripts/setup-content-tables.sql
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
