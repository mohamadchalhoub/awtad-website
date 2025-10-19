"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProjectGallery } from "@/components/project-gallery"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useContent } from "@/hooks/use-content"
import { SupabaseContentService } from "@/lib/supabase-content"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Share2, Download, Maximize2, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Tables } from "@/lib/supabase"
import SubprojectThumbnail from "@/components/SubprojectThumbnail"
import ProjectSubprojectsModal from "@/components/ProjectSubprojectsModal"

interface ProjectWithCover {
  id: number
  title: string
  category: string
  description: string
  year: string
  coverImageId?: string
  coverImageUrl?: string
  parent_id?: number | null
  subprojectsCount?: number
  subprojectsPreview?: Array<{ id: number; title: string; slug: string; thumbnail_url?: string }>
}

export default function ProjectsPage() {
  const { content, isLoading, refreshContent } = useContent()
  const { toast } = useToast()
  const router = useRouter()
  const [allProjects, setAllProjects] = useState<ProjectWithCover[]>([])
  const [projectsWithCover, setProjectsWithCover] = useState<ProjectWithCover[]>([])
  const [parentProjects, setParentProjects] = useState<ProjectWithCover[]>([])
  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectWithCover | null>(null)
  const [showSubprojectsModal, setShowSubprojectsModal] = useState(false)
  const [selectedParentProject, setSelectedParentProject] = useState<ProjectWithCover | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  // Get subprojects for a given parent (now handled by the data structure)
  const getSubProjects = (parentId: number) => {
    // This is now handled by the subprojectsPreview in the data structure
    return []
  }

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await SupabaseContentService.getAllCategories()
        setCategories(categoriesData)
      } catch (error) {
        // Error loading categories
        // Provide fallback categories so the page can still function
        const fallbackCategories = [
          { id: 1, name: 'Commercial', description: 'Commercial projects', color: '#3B82F6', icon: '🏢', created_at: new Date().toISOString(), is_active: true },
          { id: 2, name: 'Industrial', description: 'Industrial projects', color: '#10B981', icon: '🏭', created_at: new Date().toISOString(), is_active: true },
          { id: 3, name: 'Residential', description: 'Residential projects', color: '#F59E0B', icon: '🏠', created_at: new Date().toISOString(), is_active: true },
          { id: 4, name: 'Infrastructure', description: 'Infrastructure projects', color: '#8B5CF6', icon: '🌉', created_at: new Date().toISOString(), is_active: true },
          { id: 5, name: 'General', description: 'General projects', color: '#6B7280', icon: '🏗️', created_at: new Date().toISOString(), is_active: true }
        ]
        setCategories(fallbackCategories)
      }
    }
    loadCategories()
  }, [])

  // Filter projects based on selected category (only parent projects)
  useEffect(() => {
    if (selectedCategory === 'all') {
      setProjectsWithCover(parentProjects)
    } else {
      const filtered = parentProjects.filter(project => project.category === selectedCategory)
      setProjectsWithCover(filtered)
    }
  }, [selectedCategory, parentProjects])

  // REMOVED: Aggressive cache clearing on focus/visibility was causing slow reloads
  // Cache will auto-expire after 10 minutes, or user can manually refresh

  // Function to reload projects (extracted for reuse)
  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true)
      console.log('🚀 PUBLIC PROJECTS PAGE: Starting optimized load...')
      console.time('⏱️ PUBLIC PAGE - Total Load Time')
      const startTotal = performance.now()
      
      console.log('📡 Fetching parent projects with subprojects...')
      const startFetch = performance.now()
      
      // Use the optimized method that includes subprojects data
      const parentProjectsWithSubprojects = await SupabaseContentService.getParentProjectsWithSubprojects()
      
      const fetchTime = performance.now() - startFetch
      console.log(`📊 Query completed in ${fetchTime.toFixed(0)}ms`)
      
      console.log('📝 Transforming data...')
      const startTransform = performance.now()
      
      // Transform to our interface
      const projectsWithCovers = parentProjectsWithSubprojects.map(project => ({
        id: project.id,
        title: project.title,
        category: project.category,
        description: project.description,
        year: project.year,
        coverImageId: project.cover_image_id || undefined,
        coverImageUrl: project.cover_image_url || undefined,
        parent_id: project.parent_id,
        subprojectsCount: project.subprojectsCount,
        subprojectsPreview: project.subprojectsPreview
      }))
      
      const transformTime = performance.now() - startTransform
      console.log(`🔄 Transform took ${transformTime.toFixed(0)}ms`)
      
      console.log('📝 Setting state...')
      const startSetState = performance.now()
      
      setAllProjects(projectsWithCovers)
      setParentProjects(projectsWithCovers)
      setProjectsWithCover(projectsWithCovers)
      
      const setStateTime = performance.now() - startSetState
      console.log(`⚙️ State update took ${setStateTime.toFixed(0)}ms`)
      
      const totalTime = performance.now() - startTotal
      console.timeEnd('⏱️ PUBLIC PAGE - Total Load Time')
      
      // Count total subprojects
      const totalSubprojects = projectsWithCovers.reduce((sum, p) => sum + (p.subprojectsCount || 0), 0)
      
      console.log(`
╔════════════════════════════════════════════════╗
║  PUBLIC PROJECTS PAGE LOAD BREAKDOWN           ║
╠════════════════════════════════════════════════╣
║  📊 Parent Projects: ${projectsWithCovers.length.toString().padEnd(4)} items              ║
║  📁 Total Subprojects: ${totalSubprojects.toString().padEnd(4)} items            ║
╠════════════════════════════════════════════════╣
║  ⏱️  Fetch time: ${fetchTime.toFixed(0).padEnd(6)}ms                      ║
║  🔄 Transform time: ${transformTime.toFixed(0).padEnd(6)}ms                  ║
║  ⚙️  State update: ${setStateTime.toFixed(0).padEnd(6)}ms                    ║
║  🎯 TOTAL TIME: ${totalTime.toFixed(0).padEnd(6)}ms                      ║
╚════════════════════════════════════════════════╝
      `)
      
      if (totalTime > 5000) {
        console.error(`⚠️⚠️⚠️ PERFORMANCE ISSUE: Total load time ${totalTime.toFixed(0)}ms (>5s)`)
        if (fetchTime > 4000) {
          console.error('🔍 DATABASE QUERIES ARE SLOW (>4s)')
          console.error('💡 SOLUTIONS:')
          console.error('   1. Verify indexes in Supabase (run scripts/add-performance-indexes.sql)')
          console.error('   2. Check Supabase region matches your location')
          console.error('   3. Consider enabling connection pooling')
          console.error('   4. Check network latency to Supabase servers')
        } else if (setStateTime > 1000) {
          console.error('🔍 FRONTEND RENDERING IS SLOW (>1s)')
          console.error('💡 SOLUTIONS:')
          console.error('   1. Implement pagination')
          console.error('   2. Use virtualized lists')
          console.error('   3. Optimize React component rendering')
        }
      }
      
    } catch (error) {
      console.error('❌❌❌ FATAL ERROR loading projects:', error)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const handleViewDetails = (projectId: number) => {
    router.push(`/projects/${projectId}`)
  }

  const handleShare = async (project: ProjectWithCover) => {
    setSelectedProject(project)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${project.title} - AWTAD Steel Engineering`,
          text: `Check out this amazing steel engineering project: ${project.title}`,
          url: `${window.location.origin}/projects/${project.id}`,
        })
      } catch (error) {
        // Error sharing
        setShowShareDialog(true)
      }
    } else {
      setShowShareDialog(true)
    }
  }

  const copyToClipboard = async () => {
    if (!selectedProject) return
    
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/projects/${selectedProject.id}`)
      toast({
        title: "Link Copied!",
        description: "Project link has been copied to your clipboard.",
        variant: "default",
      })
      setShowShareDialog(false)
      setSelectedProject(null)
    } catch (error) {
      // Failed to copy
    }
  }

  const handleDownloadAlbum = async (project: ProjectWithCover) => {
    try {
      // Get project images from Supabase
      const allImages = await SupabaseContentService.getAllImages()
      const projectImages = allImages.filter(img => 
        img.project_id === project.id || 
        img.category.toLowerCase() === project.category.toLowerCase()
      )

      if (projectImages.length === 0) {
        toast({
          title: "No Images Available",
          description: "This project doesn't have any images to download.",
          variant: "destructive",
        })
        return
      }

      // Create a zip file with all project images
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      // Add images to zip
      for (let i = 0; i < projectImages.length; i++) {
        const image = projectImages[i]
        const response = await fetch(image.url)
        const blob = await response.blob()
        zip.file(`${project.title}_${i + 1}.jpg`, blob)
      }
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project.title}_Album.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
          } catch (error) {
        // Error downloading album
        toast({
          title: "Download Failed",
          description: "Failed to download album. Please try again.",
          variant: "destructive",
        })
      }
  }

  const handleOpenSubprojectsModal = (project: ProjectWithCover) => {
    setSelectedParentProject(project)
    setShowSubprojectsModal(true)
  }

  const handleCloseSubprojectsModal = () => {
    setShowSubprojectsModal(false)
    setSelectedParentProject(null)
  }

  // REMOVED: Blocking loading spinner - page now renders immediately

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-foreground">
            Our <span className="text-primary text-shadow-gold">Projects</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our portfolio of steel design and engineering projects, showcasing innovation, precision, and
            excellence in every structure we create.
          </p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                SupabaseContentService.clearProjectCache()
                loadProjects()
              }}
              className="text-sm"
            >
              🔄 Refresh Projects
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <ProjectGallery category="projects" showTitle={false} />
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-primary" />
                <span className="text-lg font-mono font-semibold text-foreground">Filter by Category</span>
              </div>
              <div className="flex items-center space-x-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-background border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory !== 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
            
            {/* Results count */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {projectsWithCover.length} project{projectsWithCover.length !== 1 ? 's' : ''}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingProjects ? (
              // Show skeleton loaders while loading
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-[16/9] w-full" />
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 w-10" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : projectsWithCover.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-mono font-semibold text-foreground mb-2">
                  No Projects Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {selectedCategory !== 'all' 
                    ? `No projects found in the "${selectedCategory}" category.` 
                    : 'No projects available at the moment.'
                  }
                </p>
                {selectedCategory !== 'all' && (
                  <Button
                    onClick={() => setSelectedCategory('all')}
                    variant="outline"
                    className="text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
                  >
                    View All Projects
                  </Button>
                )}
              </div>
            ) : (
              projectsWithCover.map((project) => {

  return (
                  <article 
                    key={project.id} 
                    className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Main Project Image */}
                    <div 
                      className="aspect-[16/9] bg-muted overflow-hidden cursor-pointer group relative"
                      onClick={() => handleViewDetails(project.id)}
                    >
                      {project.coverImageUrl ? (
                        <img
                          src={project.coverImageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                          <span className="text-4xl">🏗️</span>
                        </div>
                      )}
                      {/* Category and Year Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-2">
                        <span className="text-xs bg-white/90 dark:bg-black/70 text-gray-700 dark:text-gray-200 px-2 py-1 rounded backdrop-blur-sm">
                          {project.category}
                        </span>
                        <span className="text-xs bg-white/90 dark:bg-black/70 text-gray-600 dark:text-gray-300 px-2 py-1 rounded backdrop-blur-sm">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      {/* Title and Description */}
                      <div 
                        className="cursor-pointer"
                        onClick={() => handleViewDetails(project.id)}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground hover:text-primary transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Subprojects Section (Inside Card) */}
                      {project.subprojectsCount && project.subprojectsCount > 0 && (
                        <div className="pt-2 border-t border-gray-100 dark:border-border/50">
                          <h4 className="text-xs text-gray-500 dark:text-muted-foreground mb-2 flex items-center gap-1">
                            <span>↳</span>
                            <span>Subprojects ({project.subprojectsCount})</span>
                          </h4>
                          
                          {/* Horizontal Scrollable Subprojects */}
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            {project.subprojectsPreview?.slice(0, 5).map((subProject) => (
                              <SubprojectThumbnail
                                key={subProject.id}
                                subproject={subProject}
                                parentSlug={project.id.toString()}
                                size="sm"
                                showTitle={true}
                              />
                            ))}
                            
                            {/* Overlay for 6th item if more than 5 */}
                            {project.subprojectsCount > 5 && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenSubprojectsModal(project)
                                }}
                                className="flex-shrink-0 w-20 cursor-pointer group/overlay relative"
                                aria-label={`View all ${project.subprojectsCount} subprojects`}
                              >
                                <div className="w-20 h-14 rounded-md border border-gray-200 dark:border-border overflow-hidden bg-muted hover:border-gray-400 dark:hover:border-primary/50 transition-colors relative">
                                  {project.subprojectsPreview?.[5]?.thumbnail_url ? (
                                    <img
                                      src={project.subprojectsPreview[5].thumbnail_url}
                                      alt={project.subprojectsPreview[5].title}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                      <span className="text-lg">📄</span>
                                    </div>
                                  )}
                                  {/* Overlay */}
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      +{project.subprojectsCount - 5}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 text-center mt-1 truncate group-hover/overlay:text-primary transition-colors">
                                  +{project.subprojectsCount - 5} more
                                </p>
                              </div>
                            )}
                          </div>

                          {/* View All Link */}
                          {project.subprojectsCount > 6 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenSubprojectsModal(project)
                              }}
                              className="text-xs text-blue-600 dark:text-primary hover:underline mt-1"
                            >
                              View all {project.subprojectsCount} subprojects →
                            </button>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(project.id)
                          }}
                          className="flex-1 h-8 text-xs"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShare(project)
                          }}
                          className="h-8 px-3 text-xs"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Share this amazing steel engineering project with your friends and colleagues.
            </p>
            <div className="flex space-x-2">
              <Button onClick={copyToClipboard} className="flex-1">
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareDialog(false)
                  setSelectedProject(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subprojects Modal */}
      {selectedParentProject && (
        <ProjectSubprojectsModal
          isOpen={showSubprojectsModal}
          onClose={handleCloseSubprojectsModal}
          parentProject={{
            id: selectedParentProject.id,
            title: selectedParentProject.title,
            slug: selectedParentProject.id.toString()
          }}
          initialSubprojects={selectedParentProject.subprojectsPreview || []}
          totalCount={selectedParentProject.subprojectsCount || 0}
        />
      )}
    </div>
  )
}
