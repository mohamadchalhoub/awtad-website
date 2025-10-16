'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, SortAsc, SortDesc, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SubprojectThumbnail from './SubprojectThumbnail'

interface Subproject {
  id: number
  title: string
  slug: string
  thumbnail_url?: string
  created_at: string
}

interface ProjectSubprojectsModalProps {
  isOpen: boolean
  onClose: () => void
  parentProject: {
    id: number
    title: string
    slug: string
  }
  initialSubprojects: Subproject[]
  totalCount: number
}

type SortOption = 'newest' | 'oldest' | 'title'

export default function ProjectSubprojectsModal({
  isOpen,
  onClose,
  parentProject,
  initialSubprojects,
  totalCount
}: ProjectSubprojectsModalProps) {
  const [subprojects, setSubprojects] = useState<Subproject[]>(initialSubprojects)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialSubprojects.length < totalCount)

  const limit = 20

  const loadSubprojects = useCallback(async (pageNum: number, searchTerm: string, sortOption: SortOption, append = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (pageNum * limit).toString(),
        search: searchTerm,
        sort: sortOption
      })

      const response = await fetch(`/api/projects/${parentProject.id}/subprojects?${params}`)
      if (!response.ok) throw new Error('Failed to fetch subprojects')
      
      const data = await response.json()
      
      if (append) {
        setSubprojects(prev => [...prev, ...data.items])
      } else {
        setSubprojects(data.items)
      }
      
      setHasMore(data.items.length === limit)
    } catch (error) {
      console.error('Error loading subprojects:', error)
    } finally {
      setLoading(false)
    }
  }, [parentProject.id, limit])

  useEffect(() => {
    if (isOpen) {
      setSubprojects(initialSubprojects)
      setPage(0)
      setHasMore(initialSubprojects.length < totalCount)
    }
  }, [isOpen, initialSubprojects, totalCount])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(0)
    loadSubprojects(0, value, sort, false)
  }, [loadSubprojects, sort])

  const handleSort = useCallback((value: SortOption) => {
    setSort(value)
    setPage(0)
    loadSubprojects(0, search, value, false)
  }, [loadSubprojects, search])

  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    loadSubprojects(nextPage, search, sort, true)
  }, [page, search, sort, loadSubprojects])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-card rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-border">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">
              {parentProject.title} - Subprojects
            </h2>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
              {totalCount} subproject{totalCount !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 dark:border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search subprojects..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort */}
            <Select value={sort} onValueChange={handleSort}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="title">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    By Title
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {subprojects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">
                No subprojects found
              </h3>
              <p className="text-gray-600 dark:text-muted-foreground">
                {search ? 'Try adjusting your search terms' : 'This project has no subprojects yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subprojects.map((subproject) => (
                  <SubprojectThumbnail
                    key={subproject.id}
                    subproject={subproject}
                    parentSlug={parentProject.slug}
                    size="md"
                    showTitle={true}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="min-w-32"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

