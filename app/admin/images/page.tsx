"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/admin-guard"
import { AdminNavigation } from "@/components/admin-navigation"
import { ImageUpload } from "@/components/image-upload"
import { SupabaseContentService } from "@/lib/supabase-content"
import type { Tables } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type ImageData = Tables<'images'>

export default function AdminImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [deleteMessage, setDeleteMessage] = useState("")
  const [editingImage, setEditingImage] = useState<ImageData | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [price, setPrice] = useState("")

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const allImages = await SupabaseContentService.getAllImages()
      setImages(allImages)
    } catch (error) {
      console.error('Error loading images:', error)
      setImages([])
    }
  }

  const handleUploadComplete = (image: ImageData) => {
    // Add the new image to the current state instead of reloading all images
    setImages(prevImages => [image, ...prevImages])
  }

  const handleDeleteImage = async (id: string) => {
    try {
      await SupabaseContentService.deleteImage(id)
      await loadImages()
      setDeleteMessage("Image deleted successfully!")
      setTimeout(() => setDeleteMessage(""), 3000)
    } catch (error) {
      console.error('Error deleting image:', error)
      setDeleteMessage("Error deleting image!")
      setTimeout(() => setDeleteMessage(""), 3000)
    }
  }

  const handleDeleteCategory = async (category: string) => {
    if (confirm(`Are you sure you want to delete all images in the "${category}" category? This action cannot be undone.`)) {
      try {
        const imagesToDelete = images.filter(img => img.category === category)
        for (const img of imagesToDelete) {
          await SupabaseContentService.deleteImage(img.id)
        }
        await loadImages()
        setDeleteMessage(`All images in "${category}" category deleted!`)
        setTimeout(() => setDeleteMessage(""), 3000)
      } catch (error) {
        console.error('Error deleting category images:', error)
        setDeleteMessage("Error deleting category images!")
        setTimeout(() => setDeleteMessage(""), 3000)
      }
    }
  }

  const handleEditImage = (image: ImageData) => {
    setEditingImage(image)
  }

  const handleSaveImage = async () => {
    if (editingImage) {
      // Validate price
      if (editingImage.price < 0) {
        setDeleteMessage("Price must be a positive number!")
        setTimeout(() => setDeleteMessage(""), 3000)
        return
      }
      
      try {
        await SupabaseContentService.updateImage(editingImage.id, editingImage)
        await loadImages()
        setEditingImage(null)
        setDeleteMessage("Image updated successfully!")
        setTimeout(() => setDeleteMessage(""), 3000)
      } catch (error) {
        console.error('Error updating image:', error)
        setDeleteMessage("Error updating image!")
        setTimeout(() => setDeleteMessage(""), 3000)
      }
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setNewCategory("")
      setShowCategoryDialog(false)
      setDeleteMessage(`Category "${newCategory}" added! You can now upload images to it.`)
      setTimeout(() => setDeleteMessage(""), 3000)
    }
  }

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete all images? This action cannot be undone.")) {
      try {
        for (const img of images) {
          await SupabaseContentService.deleteImage(img.id)
        }
        await loadImages()
        setDeleteMessage("All images cleared!")
        setTimeout(() => setDeleteMessage(""), 3000)
      } catch (error) {
        console.error('Error clearing images:', error)
        setDeleteMessage("Error clearing images!")
        setTimeout(() => setDeleteMessage(""), 3000)
      }
    }
  }

  const filteredImages = selectedCategory === "all" ? images : images.filter((img) => img.category === selectedCategory)
  const categories = ["all", ...new Set(images.map((img) => img.category))]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCategoryStats = (category: string) => {
    const categoryImages = images.filter(img => img.category === category)
    const totalSize = categoryImages.reduce((total, img) => total + (img.file_size || 0), 0)
    return {
      count: categoryImages.length,
      size: formatFileSize(totalSize)
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminNavigation />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-mono font-bold text-foreground">
                  Album <span className="text-primary">Management</span>
                </h1>
                <p className="text-muted-foreground">Organize and manage your image albums and categories</p>
              </div>
              <div className="flex items-center space-x-3">
                <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category">Category Name</Label>
                        <Input
                          id="category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="e.g., Projects 2024, Team Photos"
                        />
                      </div>
                      <Button onClick={handleAddCategory} className="w-full">Add Category</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {deleteMessage && (
              <Alert className="border-primary/50 bg-primary/10">
                <AlertDescription className="text-primary">{deleteMessage}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="albums">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="albums">Album Overview</TabsTrigger>
                <TabsTrigger value="upload">Upload Images</TabsTrigger>
                <TabsTrigger value="manage">Manage Images</TabsTrigger>
              </TabsList>

              <TabsContent value="albums" className="space-y-6">
                {/* Category Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.filter(cat => cat !== "all").map((category) => {
                    const stats = getCategoryStats(category)
                    return (
                      <Card key={category} className="bg-card border-border hover:border-primary/50 transition-colors">
                        <CardHeader>
                          <CardTitle className="font-mono text-lg">{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-mono font-bold text-primary">{stats.count}</p>
                              <p className="text-xs text-muted-foreground">Images</p>
                            </div>
                            <div>
                              <p className="text-sm font-mono font-bold text-primary">{stats.size}</p>
                              <p className="text-xs text-muted-foreground">Total Size</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedCategory(category)}
                              className="flex-1 text-xs"
                            >
                              View Images
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCategory(category)}
                              className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Upload Statistics */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-mono">Upload Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-mono font-bold text-primary">{images.length}</p>
                        <p className="text-sm text-muted-foreground">Total Images</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-mono font-bold text-primary">{categories.length - 1}</p>
                        <p className="text-sm text-muted-foreground">Categories</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-mono font-bold text-primary">
                          {formatFileSize(images.reduce((total, img) => total + (img.file_size || 0), 0))}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Size</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-mono font-bold text-primary">
                          {images.filter((img) => img.category === "projects").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Project Images</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="space-y-6">
                <ImageUpload onUploadComplete={handleUploadComplete} />
              </TabsContent>

              <TabsContent value="manage" className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Label className="text-sm font-medium text-foreground">Filter by category:</Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-md text-foreground"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredImages.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center">
                      <div className="text-4xl text-muted-foreground mb-4">📷</div>
                      <p className="text-muted-foreground">No images found. Upload some images to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredImages.map((image) => (
                      <Card key={image.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                        <CardContent className="p-0">
                          <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="space-y-1">
                              <h3 className="text-sm font-mono font-semibold text-foreground truncate">{image.name}</h3>
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
                              <span>{formatFileSize(image.file_size || 0)}</span>
                              <span>{new Date(image.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditImage(image)}
                                className="flex-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteImage(image.id)}
                                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Edit Image Dialog */}
        {editingImage && (
          <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageName">Image Name</Label>
                  <Input
                    id="imageName"
                    value={editingImage.name}
                    onChange={(e) => setEditingImage({ ...editingImage, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="imageCategory">Category</Label>
                  <select
                    id="imageCategory"
                    value={editingImage.category}
                    onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                  >
                    {categories.filter(cat => cat !== "all").map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="imagePrice">Price (USD)</Label>
                  <Input
                    id="imagePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingImage.price || 0}
                    onChange={(e) => setEditingImage({ ...editingImage, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSaveImage} className="flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditingImage(null)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminGuard>
  )
}
