"use client"

import { useState, useEffect } from "react"
import { SupabaseContentService } from "@/lib/supabase-content"
import type { Tables } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Mail, X } from "lucide-react"
import { SmartImage } from "@/components/smart-image"

interface ProjectGalleryProps {
  projectId?: number
  category?: string
  limit?: number
  showTitle?: boolean
}

export function ProjectGallery({ projectId, category = "projects", limit, showTitle = true }: ProjectGalleryProps) {
  const [images, setImages] = useState<Tables<'images'>[]>([])
  const [selectedImage, setSelectedImage] = useState<Tables<'images'> | null>(null)
  const [loading, setLoading] = useState(true)

  const handleOrderNow = (image: Tables<'images'>) => {
    const subject = encodeURIComponent(`Order Request for ${image.name}`)
    const body = encodeURIComponent(`Hello AWTAD Team,

I would like to place an order for the following image:

Image: ${image.name}
Category: ${image.category}
Image URL: ${image.url}

Please provide me with pricing and ordering details.

Best regards,
[Your Name]`)

    const mailtoLink = `mailto:husseinnouraldeen5@gmail.com?subject=${subject}&body=${body}`
    window.open(mailtoLink)
  }

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true)
        console.log('🖼️ ProjectGallery: Loading images...', { projectId, category, limit })
        const startTime = performance.now()

        let galleryImages: Tables<'images'>[]

        if (projectId) {
          galleryImages = await SupabaseContentService.getImagesByProject(projectId)
          console.log(`📊 Loaded ${galleryImages.length} images for project ${projectId} in ${(performance.now() - startTime).toFixed(0)}ms`)
        } else {
          galleryImages = await SupabaseContentService.getImagesByCategory(category)
          console.log(`📊 Loaded ${galleryImages.length} images for category ${category} in ${(performance.now() - startTime).toFixed(0)}ms`)
        }

        if (limit) {
          galleryImages = galleryImages.slice(0, limit)
        }

        setImages(galleryImages)
      } catch (error) {
        console.error('❌ Error loading gallery images:', error)
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [projectId, category, limit])

  if (loading) {
    return (
      <div className="space-y-6">
        {showTitle && (
          <h3 className="text-xl font-mono font-semibold text-foreground">
            Project <span className="text-primary">Gallery</span>
          </h3>
        )}
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-sm">Loading images...</p>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h3 className="text-title text-foreground">
          Project <span className="text-gold italic">Gallery</span>
        </h3>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-1 transition-[transform,border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[var(--shadow-xl)]"
            onClick={() => setSelectedImage(image)}
          >
            <div className="p-0">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-2">
                <SmartImage
                  src={image.url || "/placeholder.svg"}
                  alt={image.name || 'Project image'}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
                />
                
                {/* Scrim keeps the action button legible over any photograph */}
                <span className="scrim pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--dur-base)] group-hover:opacity-70" />

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOrderNow(image)
                  }}
                  className="gold-gradient absolute bottom-3 left-3 z-10 h-8 translate-y-2 rounded-full px-3.5 text-xs text-primary-foreground opacity-0 shadow-[var(--shadow-md)] transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <Mail className="mr-1.5 h-3 w-3" />
                  Order now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div className="panel max-h-full max-w-4xl overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 border-b border-border p-4">
              <h4 className="truncate font-display text-lg font-semibold text-foreground">{selectedImage.name}</h4>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleOrderNow(selectedImage)}
                  className="gold-gradient rounded-full text-primary-foreground shadow-[var(--shadow-sm)]"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Order Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url || "/placeholder.svg"}
                alt={selectedImage.name}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
