"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { SupabaseContentService } from '@/lib/supabase-content'

interface SiteContent {
  projects: Array<{
    id: number
    title: string
    category: string
    description: string
    year: string
    coverImageId?: string
    coverImageUrl?: string
    parent_id?: number | null
  }>
  homepage: {
    heroTitle: string
    heroSubtitle: string
    heroDescription: string
    services: Array<{
      title: string
      description: string
      icon: string
    }>
  }
  about: {
    story: string
    values: Array<{
      title: string
      description: string
      icon: string
    }>
    team: Array<{
      name: string
      role: string
      bio: string
      avatar: string
    }>
  }
}

const ContentContext = createContext<{
  content: SiteContent | null
  isLoading: boolean
  refreshContent: () => Promise<void>
}>({
  content: null,
  isLoading: true,
  refreshContent: async () => {}
})

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Start as false, load on demand
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadContent = async () => {
    // Don't reload if already loaded (unless explicitly refreshed)
    if (hasLoaded && content) {
      return
    }
    
    try {
      setIsLoading(true)
      
      // OPTIMIZATION: Load only homepage and about content, NOT all projects/images
      // Projects pages will load their own data directly
      const [homepageContent, aboutContent] = await Promise.all([
        SupabaseContentService.getHomepageContent(),
        SupabaseContentService.getAboutContent()
      ])

      // Transform data to match existing structure - ONLY homepage and about content
      const transformedContent: SiteContent = {
        projects: [], // Projects load their own data
        homepage: {
          heroTitle: homepageContent.hero?.title || "",
          heroSubtitle: homepageContent.hero?.subtitle || "",
          heroDescription: homepageContent.hero?.description || "",
          services: homepageContent.services?.services || []
        },
        about: {
          story: aboutContent.story?.content || "",
          values: aboutContent.values?.values || [],
          team: aboutContent.team?.team || []
        }
      }

      setContent(transformedContent)
      setHasLoaded(true)
    } catch (error) {
      // Fallback to empty content - no dummy data
      setContent({
        projects: [],
        homepage: {
          heroTitle: "",
          heroSubtitle: "",
          heroDescription: "",
          services: []
        },
        about: {
          story: "",
          values: [],
          team: []
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshContent = async () => {
    setHasLoaded(false) // Force reload
    await loadContent()
  }

  // OPTIMIZATION: Load on mount, but only homepage/about content (not all projects/images)
  useEffect(() => {
    loadContent()
  }, [])

  // Listen for storage events to sync data across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'awtad_content_updated') {
        loadContent()
      }
    }

    const handleContentUpdate = () => {
      loadContent()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('contentUpdated', handleContentUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('contentUpdated', handleContentUpdate)
    }
  }, [])

  return (
    <ContentContext.Provider value={{ content, isLoading, refreshContent }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}

// Admin-specific hook for content management
export function useContentAdmin() {
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to trigger a content refresh
  const refreshContent = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Clear cache to ensure fresh data
      SupabaseContentService.clearProjectCache()
      
      // Update timestamp
      setLastUpdate(Date.now())
      
      // Trigger content refresh for public pages
      localStorage.setItem('awtad_content_updated', Date.now().toString())
      
      // Dispatch custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('contentUpdated'))
      }
    } catch (error) {
      // Error refreshing content
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Listen for content updates from other parts of the app
  useEffect(() => {
    const handleContentUpdate = () => {
      setLastUpdate(Date.now())
    }

    // Listen for custom events
    window.addEventListener('contentUpdated', handleContentUpdate)
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'awtad_content_updated') {
        setLastUpdate(Date.now())
      }
    }
    
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return {
    lastUpdate,
    isRefreshing,
    refreshContent
  }
}
