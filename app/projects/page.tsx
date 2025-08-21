"use client"

import { Navigation } from "@/components/navigation"
import { ProjectGallery } from "@/components/project-gallery"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useContent } from "@/hooks/use-content"
import { SupabaseContentService } from "@/lib/supabase-content"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Share2, Download, Maximize2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProjectWithCover {
  id: number
  title: string
  category: string
  description: string
  year: string
  coverImageId?: string
  coverImageUrl?: string
}

export default function ProjectsPage() {
  const { content, isLoading, refreshContent } = useContent()
  const router = useRouter()
  const [projectsWithCover, setProjectsWithCover] = useState<ProjectWithCover[]>([])
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectWithCover | null>(null)

  useEffect(() => {
    if (content?.projects) {
      // Projects already have coverImageUrl from the content hook
      setProjectsWithCover(content.projects)
    }
  }, [content])

  // Refresh content when the page becomes visible (disabled to prevent unwanted refreshes)
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden) {
  //       refreshContent()
  //     }
  //   }

  //   document.addEventListener('visibilityChange', handleVisibilityChange)
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  // }, [refreshContent])

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
        console.log('Error sharing:', error)
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
      alert('Link copied to clipboard!')
      setShowShareDialog(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Failed to copy:', error)
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
        alert('No images to download')
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
      console.error('Error downloading album:', error)
      alert('Failed to download album. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

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
        </div>
      </section>

      <section className="pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <ProjectGallery category="projects" showTitle={false} />
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectsWithCover.map((project) => (
              <Card
                key={project.id}
                className="bg-card border-border hover:border-primary/50 transition-all hover:glow-gold group cursor-pointer"
                onClick={() => handleViewDetails(project.id)}
              >
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                    {project.coverImageUrl ? (
                      <img
                        src={project.coverImageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover object-center min-w-full min-h-full group-hover:scale-105 transition-transform duration-300"
                        style={{ objectPosition: 'center center' }}
                      />
                    ) : (
                      <div className="w-full h-full steel-texture flex items-center justify-center">
                        <span className="text-muted-foreground font-mono text-sm">Project {project.id}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        {project.category}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{project.year}</span>
                    </div>
                    <h3 className="text-lg font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button 
                        size="sm" 
                        className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(project.id)
                        }}
                      >
                        View Details
                      </Button>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShare(project)
                          }}
                          className="flex-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent text-xs"
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadAlbum(project)
                          }}
                          className="flex-1 border-green-300 text-green-600 hover:bg-green-50 bg-transparent text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-secondary/50 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-mono font-bold text-xs">A</span>
            </div>
            <span className="text-lg font-mono font-bold text-primary">AWTAD</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 AWTAD. Advanced Steel Design & Engineering Solutions.</p>
        </div>
      </footer>

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
    </div>
  )
}
