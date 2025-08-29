"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SupabaseContentService } from '@/lib/supabase-content'
import { useContentAdmin } from '@/hooks/use-content'

export function ContentTest() {
  const { lastUpdate, isRefreshing, refreshContent } = useContentAdmin()
  const [projectCount, setProjectCount] = useState(0)
  const [imageCount, setImageCount] = useState(0)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      // Fetching fresh data...
      const projects = await SupabaseContentService.getAllProjects()
      const images = await SupabaseContentService.getAllImages()
      
      setProjectCount(projects.length)
      setImageCount(images.length)
      setLastFetch(new Date())
      
              // Fetched projects and images
    } catch (error) {
              // Error fetching data
    }
  }

  const clearCacheAndFetch = async () => {
    try {
              // Clearing cache and fetching fresh data...
      SupabaseContentService.clearProjectCache()
      await fetchData()
    } catch (error) {
              // Error clearing cache and fetching
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Content Cache Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Projects:</span>
            <span className="font-mono">{projectCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Images:</span>
            <span className="font-mono">{imageCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Last Fetch:</span>
            <span className="font-mono text-xs">
              {lastFetch ? lastFetch.toLocaleTimeString() : 'Never'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Last Update:</span>
            <span className="font-mono text-xs">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchData}
            className="flex-1"
          >
            Fetch Data
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={clearCacheAndFetch}
            className="flex-1"
          >
            Clear Cache
          </Button>
        </div>
        
        <Button 
          size="sm" 
          onClick={refreshContent}
          disabled={isRefreshing}
          className="w-full"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Content'}
        </Button>
      </CardContent>
    </Card>
  )
}

