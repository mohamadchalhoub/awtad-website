"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContent } from "@/hooks/use-content"
import { SupabaseContentService } from "@/lib/supabase-content"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, Calendar, Tag, Image as ImageIcon, Share2, Download, X, ChevronLeft, ChevronRight, Maximize2, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { fadeUp, stagger, viewport } from "@/lib/motion"
import { SmartImage } from "@/components/smart-image"
import { Lightbox } from "@/components/lightbox"
import { WhatsAppOrderDialog, type OrderRequest } from "@/components/whatsapp-order-dialog"

interface ProjectWithCover {
  id: number
  title: string
  category: string
  description: string
  year: string
  coverImageId?: string
  coverImageUrl?: string
  parent_id?: number | null
}

interface ProjectImage {
  id: string
  name: string
  url: string
  category: string
  uploadDate: string
  size: number
  price: number
}

export default function ProjectDetailPage() {
  const { content, isLoading, refreshContent } = useContent()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const projectId = parseInt(params.id as string)
  
  const [project, setProject] = useState<ProjectWithCover | null>(null)
  const [parentProject, setParentProject] = useState<ProjectWithCover | null>(null)
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([])
  const [subProjects, setSubProjects] = useState<ProjectWithCover[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [orderRequest, setOrderRequest] = useState<OrderRequest | null>(null)

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        try {
          setLoading(true)
          console.log('🔄 Loading project:', projectId)
          const startTime = performance.now()
          
          // Load project directly from Supabase
          const projectData = await SupabaseContentService.getProjectById(projectId)
          
          if (!projectData) {
            console.log('❌ Project not found:', projectId)
            setLoading(false)
            return
          }
          
          // Get cover image if exists
          let coverImageUrl: string | undefined = undefined
          if (projectData.cover_image_id) {
            const coverImages = await SupabaseContentService.getImagesByIds([projectData.cover_image_id])
            coverImageUrl = coverImages[0]?.url
          }
          
          const foundProject: ProjectWithCover = {
            id: projectData.id,
            title: projectData.title,
            category: projectData.category,
            description: projectData.description,
            year: projectData.year,
            coverImageId: projectData.cover_image_id || undefined,
            coverImageUrl,
            parent_id: projectData.parent_id
          }
          
          setProject(foundProject)
          
          const endTime = performance.now()
          console.log(`✅ Project loaded in ${(endTime - startTime).toFixed(2)}ms`)
          
          // If this is a subproject, find and set the parent project
          if (foundProject.parent_id) {
            const parentData = await SupabaseContentService.getProjectById(foundProject.parent_id)
            if (parentData) {
              setParentProject({
                id: parentData.id,
                title: parentData.title,
                category: parentData.category,
                description: parentData.description,
                year: parentData.year,
                parent_id: parentData.parent_id
              })
            }
          }

          // Get project images from Supabase - ONLY for this specific project
          const images = await SupabaseContentService.getImagesByProject(projectId)
          
          // Transform to match the expected format
          const transformedImages = images.map(img => ({
            id: img.id,
            name: img.name,
            url: img.url,
            category: img.category,
            uploadDate: img.created_at || new Date().toISOString(),
            size: img.file_size || 0,
            price: img.price || 0
          }))
          
          setProjectImages(transformedImages)

          // Get sub-projects from Supabase
          const subProjectsData = await SupabaseContentService.getSubProjects(projectId)
          
          // Get cover images for sub-projects (fetch only needed IDs)
          const subProjectCoverImageIds = subProjectsData
            .filter(sp => sp.cover_image_id)
            .map(sp => sp.cover_image_id!)
          
          const subProjectCoverImages = subProjectCoverImageIds.length > 0
            ? await SupabaseContentService.getImagesByIds(subProjectCoverImageIds)
            : []
          
          const coverImageMap = new Map(subProjectCoverImages.map(img => [img.id, img.url]))
          
          const subProjectsWithCovers = subProjectsData.map(sp => ({
            id: sp.id,
            title: sp.title,
            category: sp.category,
            description: sp.description,
            year: sp.year,
            coverImageId: sp.cover_image_id || undefined,
            coverImageUrl: sp.cover_image_id ? coverImageMap.get(sp.cover_image_id) : undefined
          }))
          
          setSubProjects(subProjectsWithCovers)
        } catch (error) {
          console.error('❌ Error loading project data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadProjectData()
  }, [projectId])

  // Refresh content when the page becomes visible (disabled to prevent unwanted refreshes)
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden) {
  //       refreshContent()
  //     }
  //   }

  //   document.addEventListener('visibilitychange', handleVisibilityChange)
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  // }, [refreshContent])

  const handleBackToProjects = () => {
    router.push('/projects')
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleCloseViewer = () => {
    setSelectedImageIndex(null)
  }

  const handleOrderNow = (image: { id: string; name: string; url: string }) => {
    const full = projectImages.find((i) => i.id === image.id)
    setOrderRequest({
      imageUrl: image.url,
      imageName: image.name,
      projectTitle: project?.title,
      projectCategory: project?.category,
      projectYear: project?.year,
      price: full?.price,
      pageUrl: window.location.href,
    })
  }

  const handleShare = async () => {
    if (navigator.share && project) {
      try {
        await navigator.share({
          title: `${project.title} - AWTAD Steel Engineering`,
          text: `Check out this amazing steel engineering project: ${project.title}`,
          url: window.location.href,
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
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied!",
        description: "Project link has been copied to your clipboard.",
        variant: "default",
      })
      setShowShareDialog(false)
    } catch (error) {
      // Failed to copy
    }
  }

  const handleDownloadAlbum = async () => {
          if (projectImages.length === 0) {
        toast({
          title: "No Images Available",
          description: "This project doesn't have any images to download.",
          variant: "destructive",
        })
        return
      }

    try {
      // Create a zip file with all project images
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      // Add images to zip
      for (let i = 0; i < projectImages.length; i++) {
        const image = projectImages[i]
        const response = await fetch(image.url)
        const blob = await response.blob()
        zip.file(`${project?.title}_${i + 1}.jpg`, blob)
      }
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project?.title}_Album.zip`
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // REMOVED: No loading spinner - render immediately with skeleton

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ======================= PROJECT HERO ======================= */}
      <section className="relative px-6 pb-10 pt-32">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 0%, var(--primary-muted) 0%, transparent 70%)",
          }}
        />

        <div className="shell relative">
          {/* Breadcrumb replaces the old back button as the primary wayfinder */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          >
            <Link href="/projects" className="transition-colors hover:text-primary">
              Projects
            </Link>
            {parentProject && (
              <>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                <Link
                  href={`/projects/${parentProject.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {parentProject.title}
                </Link>
              </>
            )}
            {project && (
              <>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                <span className="font-medium text-foreground">{project.title}</span>
              </>
            )}
          </nav>

          {loading || !project ? (
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="shimmer aspect-[4/3] w-full rounded-2xl bg-surface-2" />
              <div className="space-y-5">
                <div className="shimmer h-6 w-40 rounded-full bg-surface-2" />
                <div className="shimmer h-12 w-full rounded bg-surface-2" />
                <div className="shimmer h-4 w-full rounded bg-surface-2" />
                <div className="shimmer h-4 w-3/4 rounded bg-surface-2" />
                <div className="flex gap-3 pt-3">
                  <div className="shimmer h-11 w-36 rounded-full bg-surface-2" />
                  <div className="shimmer h-11 w-40 rounded-full bg-surface-2" />
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
              initial="hidden"
              animate="visible"
              variants={stagger(0.08, 0.05)}
            >
              {/* Cover */}
              <motion.div
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-[var(--shadow-xl)]"
              >
                <div className="relative aspect-[4/3] w-full">
                  <SmartImage
                    src={project.coverImageUrl}
                    alt={project.title}
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    fallback={
                      <div className="steel-texture flex h-full w-full items-center justify-center">
                        <span className="font-display text-5xl text-muted-foreground/40">
                          {project.title?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    }
                  />
                </div>
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10" />
              </motion.div>

              {/* Details */}
              <div>
                <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium tracking-wide text-primary">
                    {project.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {project.year}
                  </span>
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-headline mt-6">
                  {project.title}
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="text-lede mt-6 leading-relaxed text-muted-foreground"
                >
                  {project.description}
                </motion.p>

                <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
                  <Button
                    onClick={handleShare}
                    className="gold-gradient h-11 rounded-full px-6 text-primary-foreground shadow-[var(--shadow-md)] transition-shadow hover:shadow-[0_8px_30px_var(--primary-glow)]"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    onClick={handleDownloadAlbum}
                    variant="outline"
                    disabled={projectImages.length === 0}
                    className="h-11 rounded-full border-border px-6 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download album
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Project Images Gallery */}
      {project && projectImages.length > 0 && (
        <section className="section border-y border-border/50 bg-surface-1/40">
          <div className="shell">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-headline">
                Project <span className="text-gold italic">Gallery</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore detailed images showcasing the design, construction, and final result of this project.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {projectImages.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(index)}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-2 transition-[transform,border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-primary/45 hover:shadow-[var(--shadow-xl)]"
                >
                  <SmartImage
                    src={image.url || "/placeholder.svg"}
                    alt={image.name}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.07]"
                  />

                  {/* Scrim only on hover — nothing obscures the work at rest */}
                  <span className="scrim pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--dur-base)] group-hover:opacity-90" />

                  {/* Price, shown only when one is actually set */}
                  {image.price > 0 && (
                    <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-primary/30 bg-black/55 px-2.5 py-1 text-[11px] font-medium tabular-nums text-primary backdrop-blur-md">
                      ${image.price.toFixed(2)}
                    </span>
                  )}

                  {/* Expand affordance */}
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 scale-90 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white opacity-0 backdrop-blur-md transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] group-hover:scale-100 group-hover:opacity-100">
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </span>

                  {/* Order action, revealed on hover; always reachable on touch */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOrderNow(image)
                    }}
                    className="absolute inset-x-3 bottom-3 flex h-9 translate-y-2 items-center justify-center gap-1.5 rounded-full bg-[#25D366] text-xs font-semibold text-black opacity-0 shadow-lg transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 max-md:translate-y-0 max-md:opacity-100"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sub-Projects Section - Directly below gallery */}
      {project && subProjects.length > 0 && (
        <section className="section">
          <div className="shell">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-headline">
                Related <span className="text-gold italic">Sub-Projects</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore additional projects related to {project?.title}.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subProjects.map((subProject) => (
                <Card 
                  key={subProject.id} 
                  className="bg-card border-border hover:border-primary/50 transition-all hover:glow-gold group shadow-lg cursor-pointer"
                  onClick={() => router.push(`/projects/${subProject.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                      {subProject.coverImageUrl ? (
                        <div className="relative h-full w-full">
                          <SmartImage
                            src={subProject.coverImageUrl}
                            alt={subProject.title}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover object-center transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-soft)] group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full steel-texture flex items-center justify-center">
                          <span className="text-muted-foreground font-mono text-sm">Project {subProject.id}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                          {subProject.category}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{subProject.year}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {subProject.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {subProject.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Project Details */}
      {project && (
        <section className="section">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-headline">
                Project <span className="text-gold italic">Details</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive information about this steel engineering project.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Project Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Tag className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Category</p>
                        <p className="text-sm text-muted-foreground">{project.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Year</p>
                        <p className="text-sm text-muted-foreground">{project.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Images</p>
                        <p className="text-sm text-muted-foreground">{projectImages.length} photos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Back to Projects CTA */}
      <section className="section">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-title">
            Explore More <span className="text-gold italic">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our complete portfolio of steel design and engineering solutions.
          </p>
          <Button onClick={handleBackToProjects} className="gold-gradient text-primary-foreground hover:opacity-90 px-8">
            View All Projects
          </Button>
        </div>
      </section>

      {/* Full-screen image viewer */}
      <Lightbox
        images={projectImages}
        index={selectedImageIndex}
        caption={project?.title}
        onClose={handleCloseViewer}
        onIndexChange={setSelectedImageIndex}
        onOrder={handleOrderNow}
      />

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
                onClick={() => setShowShareDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp order enquiry */}
      <WhatsAppOrderDialog order={orderRequest} onClose={() => setOrderRequest(null)} />

      <Footer />
    </div>
  )
}
