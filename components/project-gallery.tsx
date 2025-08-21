"use client"

import { useState, useEffect } from "react"
import { ImageService, type ImageData } from "@/lib/images"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProjectGalleryProps {
  projectId?: number
  category?: string
  limit?: number
  showTitle?: boolean
}

export function ProjectGallery({ projectId, category = "projects", limit, showTitle = true }: ProjectGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

  useEffect(() => {
    let galleryImages: ImageData[]

    if (projectId) {
      galleryImages = ImageService.getImagesByProject(projectId)
    } else {
      galleryImages = ImageService.getImagesByCategory(category)
    }

    if (limit) {
      galleryImages = galleryImages.slice(0, limit)
    }

    setImages(galleryImages)
  }, [projectId, category, limit])

  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h3 className="text-xl font-mono font-semibold text-foreground">
          Project <span className="text-primary">Gallery</span>
        </h3>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card
            key={image.id}
            className="bg-card border-border hover:border-primary/50 transition-all hover:glow-gold group cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <CardContent className="p-0">
              <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h4 className="font-mono font-semibold text-foreground">{selectedImage.name}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
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
