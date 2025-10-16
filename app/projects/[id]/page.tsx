"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useContent } from "@/hooks/use-content"
import { SupabaseContentService } from "@/lib/supabase-content"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Calendar, Tag, Image as ImageIcon, Share2, Download, X, ChevronLeft, ChevronRight, Maximize2, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface ProjectWithCover {
  id: number
  title: string
  category: string
  description: string
  year: string
  coverImageId?: string
  coverImageUrl?: string
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
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([])
  const [subProjects, setSubProjects] = useState<ProjectWithCover[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsappContent, setWhatsappContent] = useState<{subject: string, body: string, imageUrl: string} | null>(null)

  useEffect(() => {
    const loadProjectData = async () => {
      if (content?.projects && projectId) {
        // Find the project
        const foundProject = content.projects.find(p => p.id === projectId)
        if (foundProject) {
          // The project already has coverImageUrl from the content hook
          setProject(foundProject)

          // Get project images from Supabase
          try {
            const allImages = await SupabaseContentService.getAllImages()
            const images = allImages.filter(img => 
              img.project_id === projectId || 
              img.category.toLowerCase() === foundProject.category.toLowerCase()
            )
            
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
          } catch (error) {
            // Error loading project images
            setProjectImages([])
          }

          // Get sub-projects from Supabase
          try {
            const subProjectsData = await SupabaseContentService.getSubProjects(projectId)
            
            // Get cover images for sub-projects
            const allImages = await SupabaseContentService.getAllImages()
            const subProjectsWithCovers = subProjectsData.map(sp => {
              const coverImage = sp.cover_image_id 
                ? allImages.find(img => img.id === sp.cover_image_id) 
                : null
              
              return {
                id: sp.id,
                title: sp.title,
                category: sp.category,
                description: sp.description,
                year: sp.year,
                coverImageId: sp.cover_image_id || undefined,
                coverImageUrl: coverImage?.url || undefined
              }
            })
            
            setSubProjects(subProjectsWithCovers)
          } catch (error) {
            // Error loading sub-projects
            setSubProjects([])
          }
        }
        setLoading(false)
      }
    }

    loadProjectData()
  }, [content, projectId])

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

  const handleOrderNow = (image: ProjectImage) => {
          // handleOrderNow called with image
    
    // Create clean WhatsApp message content
    const message = `Hello AWTAD Team! 🏗️

I would like to place an order for the following project image:

📋 PROJECT DETAILS:
• Project Title: ${project?.title}
• Project Category: ${project?.category}
• Project Year: ${project?.year}
• Project Description: ${project?.description}

🖼️ IMAGE DETAILS:
• Image Name: ${image.name}
• Image Category: ${image.category}
• Image Size: ${formatFileSize(image.size)}
• Price: $${(image.price || 0).toFixed(2)}

🔗 Project URL: ${window.location.href}

📸 Image Reference: ${image.name}

Thank you! I look forward to hearing from you.`

    // Create WhatsApp link
    const whatsappNumber = '+96171175906'
    const encodedMessage = encodeURIComponent(message)
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
          // Opening WhatsApp link
    
    // Check if we're on mobile or desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // On mobile, try to open WhatsApp app
      try {
        const whatsappWindow = window.open(whatsappLink, '_blank')
        
        if (!whatsappWindow) {
          // Fallback: show WhatsApp modal
          setWhatsappContent({ 
            subject: `WhatsApp Order Request for ${image.name}`, 
            body: message, 
            imageUrl: image.url 
          })
          setShowWhatsAppModal(true)
        }
      } catch (error) {
        // Error opening WhatsApp on mobile
        setWhatsappContent({ 
          subject: `WhatsApp Order Request for ${image.name}`, 
          body: message, 
          imageUrl: image.url 
        })
        setShowWhatsAppModal(true)
      }
    } else {
      // On desktop, always show the modal first with WhatsApp Web option
      setWhatsappContent({ 
        subject: `WhatsApp Order Request for ${image.name}`, 
        body: message, 
        imageUrl: image.url 
      })
      setShowWhatsAppModal(true)
    }
  }

  const handlePreviousImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === 0 ? projectImages.length - 1 : selectedImageIndex - 1)
    }
  }

  const handleNextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === projectImages.length - 1 ? 0 : selectedImageIndex + 1)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImageIndex !== null) {
      if (e.key === 'Escape') {
        handleCloseViewer()
      } else if (e.key === 'ArrowLeft') {
        handlePreviousImage()
      } else if (e.key === 'ArrowRight') {
        handleNextImage()
      }
    }
  }

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImageIndex])

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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="text-4xl text-muted-foreground mb-4">❌</div>
            <h1 className="text-3xl font-mono font-bold text-foreground">Project Not Found</h1>
            <p className="text-lg text-muted-foreground">The project you're looking for doesn't exist.</p>
            <Button onClick={handleBackToProjects} className="gold-gradient text-primary-foreground hover:opacity-90">
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Cover Image */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBackToProjects}
            className="mb-6 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
                         {/* Cover Image */}
             <div className="aspect-video bg-muted rounded-lg overflow-hidden">
               {project.coverImageUrl ? (
                 <img
                   src={project.coverImageUrl}
                   alt={project.title}
                   className="w-full h-full object-cover object-center min-w-full min-h-full"
                   style={{ objectPosition: 'center center' }}
                 />
               ) : (
                 <div className="w-full h-full steel-texture flex items-center justify-center">
                   <span className="text-muted-foreground font-mono text-lg">No Cover Image</span>
                 </div>
               )}
             </div>

            {/* Project Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-mono text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{project.year}</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-foreground">
                  {project.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Album
                </Button>
                <Button
                  onClick={handleDownloadAlbum}
                  variant="outline"
                  className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
                  disabled={projectImages.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Album
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Images Gallery */}
      {projectImages.length > 0 && (
        <section className="py-16 px-6 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
                Project <span className="text-primary">Gallery</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore detailed images showcasing the design, construction, and final result of this project.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projectImages.map((image, index) => (
                <Card 
                  key={image.id} 
                  className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <CardContent className="p-0">
                                                             <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Order Now Button - Top Left */}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOrderNow(image)
                        }}
                        className="absolute top-2 left-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg z-50 text-xs px-2 py-1 h-7 border-2 border-white hover:scale-105 transition-transform"
                      >
                                  <MessageCircle className="w-3 h-3 mr-1" />
          Order via WhatsApp
                      </Button>
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-foreground truncate">{image.name}</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                            {image.category}
                          </p>
                          <p className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                            ${(image.price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(image.size)}</span>
                        <span>{new Date(image.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sub-Projects Section - Directly below gallery */}
      {subProjects.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
                Related <span className="text-primary">Sub-Projects</span>
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
                        <img
                          src={subProject.coverImageUrl}
                          alt={subProject.title}
                          className="w-full h-full object-cover object-center min-w-full min-h-full group-hover:scale-105 transition-transform duration-300"
                          style={{ objectPosition: 'center center' }}
                        />
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
                      <h3 className="text-lg font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
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
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
              Project <span className="text-primary">Details</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive information about this steel engineering project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-mono font-semibold text-foreground">Project Information</h3>
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
                <h3 className="text-xl font-mono font-semibold text-foreground">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Back to Projects CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-mono font-bold text-foreground">
            Explore More <span className="text-primary">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our complete portfolio of steel design and engineering solutions.
          </p>
          <Button onClick={handleBackToProjects} className="gold-gradient text-primary-foreground hover:opacity-90 px-8">
            View All Projects
          </Button>
        </div>
      </section>

      {/* Full Screen Image Viewer */}
      {selectedImageIndex !== null && (
        <Dialog open={true} onOpenChange={handleCloseViewer}>
          <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Full Screen Image Viewer</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseViewer}
                className="absolute top-4 right-4 z-50 bg-black/50 text-white hover:bg-black/70 border border-white/20"
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Order Now Button - Top Left */}
              <Button
                size="sm"
                onClick={() => handleOrderNow(projectImages[selectedImageIndex])}
                className="absolute top-4 left-4 z-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-4 py-2"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Order via WhatsApp
              </Button>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-black/50 text-white hover:bg-black/70 border border-white/20"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 bg-black/50 text-white hover:bg-black/70 border border-white/20"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>

              {/* Image Display */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={projectImages[selectedImageIndex].url}
                  alt={projectImages[selectedImageIndex].name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Image Info */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/70 text-white px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">{projectImages[selectedImageIndex].name}</p>
                <p className="text-xs text-gray-300">
                  {selectedImageIndex + 1} of {projectImages.length}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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

      {/* WhatsApp Order Modal */}
      <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>WhatsApp Order Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">📱 WhatsApp Details:</h4>
              <p><strong>To:</strong> +96171175906 (AWTAD Team)</p>
              <p><strong>Platform:</strong> WhatsApp</p>
              <p className="text-sm text-green-700 mt-2">
                💡 <strong>Desktop Users:</strong> Use "Open WhatsApp Web" button below to open WhatsApp in your browser
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">WhatsApp Message:</h4>
              <div className="p-3 bg-background border rounded-lg max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{whatsappContent?.body}</pre>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🖼️ Image Reference:</h4>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Image Name:</strong> {whatsappContent?.imageUrl ? whatsappContent.imageUrl.split('/').pop()?.split('.')[0] || 'N/A' : 'N/A'}
              </p>
              <p className="text-sm text-blue-700">
                The image name is included in the WhatsApp message for easy reference.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  // Copy WhatsApp message to clipboard
                  if (whatsappContent) {
                    const fullMessage = `${whatsappContent.body}`
                    navigator.clipboard.writeText(fullMessage)
                    toast({
          title: "Message Copied!",
          description: "WhatsApp message has been copied to your clipboard.",
          variant: "default",
        })
                  }
                }}
                className="flex-1"
              >
                Copy WhatsApp Message
              </Button>
              <Button
                onClick={() => {
                  // Open WhatsApp Web for desktop users
                  if (whatsappContent) {
                    const whatsappNumber = '+96171175906'
                    const encodedMessage = encodeURIComponent(whatsappContent.body)
                    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
                    window.open(whatsappLink, '_blank')
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                📱 Open WhatsApp Web
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWhatsAppModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
