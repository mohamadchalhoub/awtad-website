"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProjectGallery } from "@/components/project-gallery"
import { Button } from "@/components/ui/button"
import { ProjectCard, ProjectCardSkeleton } from "@/components/project-card"
import { useContent } from "@/hooks/use-content"
import { SupabaseContentService } from "@/lib/supabase-content"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Share2, Filter, RefreshCw, SearchX, Copy } from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"
import { SmartImage } from "@/components/smart-image"
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

/** Pill category filter — replaces the old dropdown, which hid the
 *  categories behind a click and read as an admin control. */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] ${
        active
          ? "border-primary/60 bg-primary/15 text-primary shadow-[0_0_20px_var(--primary-glow)]"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
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
      // Get project images from Supabase - ONLY for this specific project
      const projectImages = await SupabaseContentService.getImagesByProject(project.id)

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

      {/* ===================== PAGE HEADER ===================== */}
      <section className="relative px-6 pb-4 pt-36">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 0%, var(--primary-muted) 0%, transparent 70%)",
          }}
        />
        <motion.div
          className="shell relative text-center"
          initial="hidden"
          animate="visible"
          variants={stagger(0.07, 0.1)}
        >
          <motion.p variants={fadeUp} className="eyebrow">
            Portfolio
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-headline mt-4">
            Every piece we&apos;ve <span className="text-gold italic">made</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lede mx-auto mt-6 max-w-2xl text-muted-foreground"
          >
            Browse the full archive of commissions — metal portraits, calligraphy,
            wall art and custom steel work, each made once.
          </motion.p>
          <motion.hr variants={fadeUp} className="rule-gold mx-auto mt-10 w-28" />
        </motion.div>
      </section>

      <section className="px-6 pb-8">
        <div className="shell">
          <ProjectGallery category="projects" showTitle={false} />
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="shell">
          {/* ===================== FILTERS ===================== */}
          <div className="mb-12 flex flex-col gap-5 border-b border-border/60 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="mr-1 h-4 w-4 text-primary" />
                <FilterChip
                  label="All work"
                  active={selectedCategory === "all"}
                  onClick={() => setSelectedCategory("all")}
                />
                {categories.map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    active={selectedCategory === category.name}
                    onClick={() => setSelectedCategory(category.name)}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm tabular-nums text-muted-foreground">
                  {projectsWithCover.length} piece
                  {projectsWithCover.length !== 1 ? "s" : ""}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Refresh projects"
                  title="Refresh projects"
                  onClick={() => {
                    SupabaseContentService.clearProjectCache()
                    loadProjects()
                  }}
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={stagger()}
          >

            {isLoadingProjects ? (
              Array.from({ length: 6 }).map((_, index) => (
                <ProjectCardSkeleton key={index} />
              ))
            ) : projectsWithCover.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="col-span-full rounded-2xl border border-dashed border-border py-24 text-center"
              >
                <SearchX className="mx-auto h-8 w-8 text-primary/50" />
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  Nothing here yet
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                  {selectedCategory !== "all"
                    ? `No pieces in the “${selectedCategory}” category.`
                    : "No work has been published yet. Please check back soon."}
                </p>
                {selectedCategory !== "all" && (
                  <Button
                    onClick={() => setSelectedCategory("all")}
                    variant="outline"
                    className="mt-7 rounded-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Show all work
                  </Button>
                )}
              </motion.div>
            ) : (
              projectsWithCover.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={handleViewDetails}
                  actions={
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(project.id)
                        }}
                        className="h-9 flex-1 rounded-full bg-primary/12 text-xs font-medium text-primary shadow-none transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        View details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Share ${project.title}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(project)
                        }}
                        className="h-9 w-9 rounded-full border-border p-0 text-muted-foreground hover:border-primary/50 hover:text-primary"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  }
                >
                  {/* Subproject strip, kept inside the shared card shell */}
                  {project.subprojectsCount && project.subprojectsCount > 0 ? (
                    <div className="mt-1 border-t border-border/60 pt-3">
                      <p className="mb-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {project.subprojectsCount} in this series
                      </p>

                      <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                        {project.subprojectsPreview?.slice(0, 5).map((subProject) => (
                          <SubprojectThumbnail
                            key={subProject.id}
                            subproject={subProject}
                            parentSlug={project.id.toString()}
                            size="sm"
                            showTitle={false}
                          />
                        ))}

                        {project.subprojectsCount > 5 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenSubprojectsModal(project)
                            }}
                            aria-label={`View all ${project.subprojectsCount} pieces in this series`}
                            className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/50"
                          >
                            <SmartImage
                              src={project.subprojectsPreview?.[5]?.thumbnail_url}
                              alt=""
                              sizes="80px"
                              quality={60}
                              className="object-cover"
                              fallback={
                                <span className="steel-texture block h-full w-full bg-surface-2" />
                              }
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/65 text-xs font-medium text-white backdrop-blur-[1px]">
                              +{project.subprojectsCount - 5}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </ProjectCard>
              ))
            )}
          </motion.div>
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
