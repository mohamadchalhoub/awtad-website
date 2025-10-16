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
  const [isLoading, setIsLoading] = useState(true)

  const loadContent = async () => {
    try {
      setIsLoading(true)
      
      // Load projects from Supabase
      const projects = await SupabaseContentService.getAllProjects()
      
      // Load all images to get cover image URLs
      const allImages = await SupabaseContentService.getAllImages()
      
      // Load homepage content from Supabase
      const homepageContent = await SupabaseContentService.getHomepageContent()
      
      // Load about content from Supabase
      const aboutContent = await SupabaseContentService.getAboutContent()

      // Transform data to match existing structure - ONLY use real database data
      const transformedContent: SiteContent = {
        projects: projects.map(project => {
          // Find cover image for this project
          let coverImageUrl = undefined
          if (project.cover_image_id) {
            const coverImage = allImages.find(img => img.id === project.cover_image_id)
            if (coverImage) {
              coverImageUrl = coverImage.url
            }
          }
          
          return {
            id: project.id,
            title: project.title,
            category: project.category,
            description: project.description,
            year: project.year,
            coverImageId: project.cover_image_id || undefined,
            coverImageUrl,
            parent_id: project.parent_id
          }
        }),
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
    await loadContent()
  }

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
