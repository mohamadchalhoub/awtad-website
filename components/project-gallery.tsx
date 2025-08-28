"use client"

import { useState, useEffect } from "react"
import { ImageService, type ImageData } from "@/lib/images"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

interface ProjectGalleryProps {
  projectId?: number
  category?: string
  limit?: number
  showTitle?: boolean
}

export function ProjectGallery({ projectId, category = "projects", limit, showTitle = true }: ProjectGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

  const handleOrderNow = (image: ImageData) => {
    const subject = encodeURIComponent(`Order Request for ${image.name}`)
    const body = encodeURIComponent(`Hello AWTAD Team,

I would like to place an order for the following image:

Image: ${image.name}
Category: ${image.category}
Image URL: ${image.url}

Please provide me with pricing and ordering details.

Best regards,
[Your Name]`)

    const mailtoLink = `mailto:info@awtad.com?subject=${subject}&body=${body}`
    window.open(mailtoLink)
  }

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
              <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden relative">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                
                {/* Order Now Button - Top Left */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOrderNow(image)
                  }}
                  className="absolute top-2 left-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg z-10 text-xs px-2 py-1 h-7"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Order Now
                </Button>
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
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleOrderNow(selectedImage)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Order Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
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
