"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Image as ImageIcon, FileImage, X } from "lucide-react"
import { SupabaseContentService } from "@/lib/supabase-content"
import type { Tables } from "@/lib/supabase"

type ImageData = Tables<'images'>

interface ImageUploadProps {
  onUploadComplete?: (image: ImageData) => void
  defaultCategory?: string
  projectId?: number
  categories?: { id: number; name: string }[]
}

export function ImageUpload({ onUploadComplete, defaultCategory = "general", projectId, categories }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [category, setCategory] = useState(defaultCategory)
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const defaultCategories = ["general", "Commercial", "Industrial", "Residential", "Infrastructure", "projects", "team", "services", "hero"]
  const categoryOptions = categories?.map(cat => cat.name) || defaultCategories

  // Convert file to base64 data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      setIsUploading(true)
      setError("")
      setSuccess("")

      try {
        // Validate price input
        const priceValue = parseFloat(price)
        if (price && (isNaN(priceValue) || priceValue < 0)) {
          setError("Price must be a valid positive number")
          setIsUploading(false)
          return
        }

        const file = files[0]
        setSelectedFile(file)
        
        // Convert file to base64 data URL for persistent storage
        const dataUrl = await fileToDataUrl(file)
        
        // Create image data for Supabase
        const imageData = {
          name: file.name,
          url: dataUrl,
          category: category,
          project_id: projectId || null,
          file_size: file.size,
          mime_type: file.type,
          alt_text: null,
          is_cover_image: false,
          created_by: null,
          price: priceValue || 0
        }

        // Upload to Supabase
        const uploadedImage = await SupabaseContentService.createImage(imageData)
        
        if (uploadedImage) {
          setSuccess(`Image "${file.name}" uploaded successfully!`)
          onUploadComplete?.(uploadedImage)
        } else {
          setError("Failed to upload image to database")
        }
        
        // Note: We don't need to revoke URLs anymore since we're using data URLs
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setIsUploading(false)
        setTimeout(() => {
          setSuccess("")
          setError("")
        }, 3000)
      }
    },
    [category, price, projectId, onUploadComplete],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload],
  )

  const clearSelection = () => {
    setSelectedFile(null)
    setError("")
    setSuccess("")
  }

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Image Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Price (USD)</label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="bg-background border-border"
        />
      </div>

      {/* File Selection Display */}
      {selectedFile && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileImage className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {category} • ${parseFloat(price || "0").toFixed(2)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-green-600 hover:text-green-800 hover:bg-green-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      {!selectedFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging 
              ? "border-primary bg-primary/10 scale-105" 
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              {isUploading ? (
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                {isUploading ? "Uploading..." : "Drop your image here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG, GIF • Max: 5MB
              </p>
            </div>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
              className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <Alert className="border-red-300 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-300 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
