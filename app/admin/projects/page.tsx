"use client"

import { AdminNavigation } from "@/components/admin-navigation"
import { AdminGuard } from "@/components/admin-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { SupabaseContentService } from "@/lib/supabase-content"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Edit, Trash2, Crown } from "lucide-react"
import type { Tables } from "@/lib/supabase"
import { ImageUpload } from "@/components/image-upload"
import { ProjectsGridSkeleton } from "@/components/loading-skeleton"
import { useContentAdmin } from "@/hooks/use-content"

interface ProjectWithCover extends Tables<'projects'> {
  coverImage?: Tables<'images'>
}

const AdminProjectsPage = React.memo(function AdminProjectsPage() {
  const { refreshContent } = useContentAdmin()
  const [projects, setProjects] = useState<Tables<'projects'>[]>([])
  const [images, setImages] = useState<Tables<'images'>[]>([])
  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Tables<'projects'> | null>(null)
  const [editingImage, setEditingImage] = useState<Tables<'images'> | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(12) // Limit initial display for performance

  // Form states
  const [newProject, setNewProject] = useState({
    title: '',
    category: '',
    year: '',
    description: '',
    featured: false
  })

  const [editProject, setEditProject] = useState({
    title: '',
    category: '',
    year: '',
    description: '',
    featured: false
  })

  const [editImage, setEditImage] = useState({
    name: '',
    category: ''
  })

  // Success/Error states for image upload
  const [uploadSuccess, setUploadSuccess] = useState("")
  const [uploadError, setUploadError] = useState("")

  // Auto-clear success/error messages
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [uploadSuccess])

  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [uploadError])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached, but continuing to load data...')
      }
    }, 30000)

    loadData()
    
    return () => clearTimeout(timeoutId)
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading data from Supabase...')
      
      // Don't clear cache on every load - only clear when needed
      // SupabaseContentService.clearProjectCache()
      
      // Remove connection test - it adds unnecessary delay
      // const connectionTest = await SupabaseContentService.testConnection()
      // if (!connectionTest.success) {
      //   throw new Error(`Database connection failed: ${connectionTest.error}`)
      // }
      
      // Fetch data in parallel for better performance
      const [projectsData, imagesData, categoriesData] = await Promise.all([
        SupabaseContentService.getAllProjects(),
        SupabaseContentService.getAllImages(),
        SupabaseContentService.getAllCategories()
      ])
      
      setProjects(projectsData)
      setImages(imagesData)
      setCategories(categoriesData)
      
      console.log('Data loading completed successfully')
    } catch (error) {
      console.error('Error loading data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setProjects([])
      setImages([])
      setCategories([])
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAddProject = async () => {
    try {
      // Check if category exists, if not create it
      let categoryToUse = newProject.category
      const existingCategory = categories.find(cat => cat.name.toLowerCase() === newProject.category.toLowerCase())
      
      if (!existingCategory && newProject.category.trim()) {
        // Create new category
        const newCategory = await SupabaseContentService.createCategory({
          name: newProject.category.trim(),
          description: `Category for ${newProject.title}`,
          color: '#3B82F6',
          icon: '🏗️',
          is_active: true
        })
        
        if (newCategory) {
          categoryToUse = newCategory.name
          // Refresh categories list
          const updatedCategories = await SupabaseContentService.getAllCategories()
          setCategories(updatedCategories)
        }
      }

      const result = await SupabaseContentService.createProject({
        title: newProject.title,
        category: categoryToUse,
        year: newProject.year,
        description: newProject.description,
        is_active: true,
        featured: newProject.featured
      })

      if (result) {
        setShowAddDialog(false)
        setNewProject({ title: '', category: '', year: '', description: '', featured: false })
        SupabaseContentService.clearProjectCache()
        await loadData()
      }
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  const handleEditProject = async () => {
    if (!editingProject) return

    try {
      // Check if category exists, if not create it
      let categoryToUse = editProject.category
      const existingCategory = categories.find(cat => cat.name.toLowerCase() === editProject.category.toLowerCase())
      
      if (!existingCategory && editProject.category.trim()) {
        // Create new category
        const newCategory = await SupabaseContentService.createCategory({
          name: editProject.category.trim(),
          description: `Category for ${editProject.title}`,
          color: '#3B82F6',
          icon: '🏗️',
          is_active: true
        })
        
        if (newCategory) {
          categoryToUse = newCategory.name
          // Refresh categories list
          const updatedCategories = await SupabaseContentService.getAllCategories()
          setCategories(updatedCategories)
        }
      }

             console.log('Updating project with featured status:', editProject.featured)
       const result = await SupabaseContentService.updateProject(editingProject.id, {
         title: editProject.title,
         category: categoryToUse,
         year: editProject.year,
         description: editProject.description,
         featured: editProject.featured
       })

      if (result) {
        setShowEditDialog(false)
        setEditingProject(null)
        setEditProject({ title: '', category: '', year: '', description: '', featured: false })
        SupabaseContentService.clearProjectCache()
        await loadData()
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const result = await SupabaseContentService.deleteProject(projectId)
        if (result) {
          SupabaseContentService.clearProjectCache()
          await loadData()
        }
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const handleEditImage = async () => {
    if (!editingImage) return

    try {
      const result = await SupabaseContentService.updateImage(editingImage.id, {
        name: editImage.name,
        category: editImage.category
      })

      if (result) {
        setShowImageDialog(false)
        setEditingImage(null)
        setEditImage({ name: '', category: '' })
        SupabaseContentService.clearProjectCache()
        await loadData()
      }
    } catch (error) {
      console.error('Error updating image:', error)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        const result = await SupabaseContentService.deleteImage(imageId)
        if (result) {
          SupabaseContentService.clearProjectCache()
          await loadData()
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }
  }

  const handleSetCoverImage = async (imageId: string, projectId: number) => {
    try {
      const result = await SupabaseContentService.setCoverImage(imageId, projectId)
      if (result) {
        SupabaseContentService.clearProjectCache()
        await loadData()
        await refreshContent()
        setUploadSuccess('Cover image set successfully! It will now appear on public pages.')
      } else {
        setUploadError('Failed to set cover image. Please try again.')
      }
    } catch (error) {
      console.error('Error setting cover image:', error)
      setUploadError('Error setting cover image: ' + error)
    }
  }

  const handleRemoveCoverImage = async (projectId: number) => {
    try {
      const result = await SupabaseContentService.updateProject(projectId, {
        cover_image_id: null
      })
      if (result) {
        SupabaseContentService.clearProjectCache()
        await loadData()
      }
    } catch (error) {
      console.error('Error removing cover image:', error)
    }
  }

  const openEditDialog = (project: Tables<'projects'>) => {
    console.log('Opening edit dialog for project:', project)
    console.log('Project featured status:', (project as any).featured)
    setEditingProject(project)
    setEditProject({
      title: project.title,
      category: project.category,
      year: project.year,
      description: project.description,
      featured: Boolean((project as any).featured)
    })
    setShowEditDialog(true)
  }

  const openImageDialog = (image: Tables<'images'>) => {
    setEditingImage(image)
    setEditImage({
      name: image.name,
      category: image.category
    })
    setShowImageDialog(true)
  }

  const getProjectImages = useCallback((projectId: number) => {
    return images.filter(img => img.project_id === projectId)
  }, [images])

  const getCoverImage = useCallback((projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project || !project.cover_image_id) {
      return null
    }
    return images.find(img => img.id === project.cover_image_id)
  }, [images, projects])

  const projectsWithCoverImages = useMemo(() => {
    return projects.map(project => ({
      ...project,
      coverImage: getCoverImage(project.id)
    }))
  }, [projects, getCoverImage])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavigation />
        <AdminGuard>
          <div className="pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
                  Project <span className="text-primary">Management</span>
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-muted-foreground">Loading data...</span>
                </div>
              </div>
              <ProjectsGridSkeleton />
            </div>
          </div>
        </AdminGuard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <AdminGuard>
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-600">⚠️</div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-800">Data Loading Issue</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
                Project <span className="text-primary">Management</span>
              </h1>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setLoading(true)
                    setError(null)
                    SupabaseContentService.clearProjectCache()
                    await loadData()
                  }}
                  className="text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    '🔄 Refresh Data'
                  )}
                </Button>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="gold-gradient text-primary-foreground hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        placeholder="Project title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <div className="space-y-2">
                        <Input
                          id="category"
                          value={newProject.category}
                          onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                          placeholder="Type a category name (e.g., Commercial, Industrial, or create new)"
                          list="category-suggestions"
                        />
                        <datalist id="category-suggestions">
                          {categories.map(category => (
                            <option key={category.id} value={category.name} />
                          ))}
                        </datalist>
                        <p className="text-xs text-muted-foreground">
                          Type an existing category or create a new one. Existing categories will be auto-completed.
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        value={newProject.year}
                        onChange={(e) => setNewProject({ ...newProject, year: e.target.value })}
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder="Project description"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        id="featured"
                        type="checkbox"
                        checked={newProject.featured}
                        onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-offset-0"
                      />
                      <Label htmlFor="featured" className="text-sm font-medium">
                        ⭐ Featured Project
                      </Label>
                      <div className="text-xs text-muted-foreground ml-2">
                        (Will appear on homepage)
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleAddProject} className="flex-1">
                        Add Project
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>



            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="bg-card border-border animate-pulse">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-muted rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-4 bg-muted rounded w-16"></div>
                            <div className="h-4 bg-muted rounded w-12"></div>
                          </div>
                          <div className="h-5 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-full"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-muted rounded w-20"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 bg-muted rounded flex-1"></div>
                          <div className="h-8 bg-muted rounded flex-1"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : projectsWithCoverImages.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🏗️</div>
                  <h3 className="text-xl font-mono font-semibold text-foreground mb-2">
                    {loading ? 'Loading Projects...' : 'No Projects Found'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {loading 
                      ? 'Please wait while we load your projects from the database...'
                      : 'Get started by adding your first project using the button above.'
                    }
                  </p>
                  {!loading && (
                    <Button
                      onClick={() => setShowAddDialog(true)}
                      className="gold-gradient text-primary-foreground hover:opacity-90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Project
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {projectsWithCoverImages.slice(0, displayLimit).map((project) => {
                    const projectImages = getProjectImages(project.id)
                    const coverImage = project.coverImage
                    
                    return (
                      <Card key={project.id} className="bg-card border-border hover:border-primary/50 transition-all">
                        <CardContent className="p-0">
                          <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden relative rounded-t-lg">
                            {coverImage && coverImage.url ? (
                              <img 
                                src={coverImage.url} 
                                alt={coverImage.name} 
                                className="w-full h-full object-cover object-center min-w-full min-h-full" 
                                loading="lazy"
                                decoding="async"
                                style={{ objectPosition: 'center center' }}
                                onError={(e) => {
                                  console.error(`Failed to load cover image: ${coverImage.name}`, e)
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                                onLoad={() => {
                                  // Image loaded successfully
                                }}
                              />
                            ) : null}
                            <div className={`absolute inset-0 flex items-center justify-center text-muted-foreground ${coverImage && coverImage.url ? 'hidden' : ''}`}>
                              <div className="text-center">
                                <div className="text-4xl mb-2">🏗️</div>
                                <p className="text-sm">No cover image</p>
                              </div>
                            </div>
                            {coverImage && coverImage.url && (
                              <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
                                Cover
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                  {project.category}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">{project.year}</span>
                              </div>
                              <h3 className="text-lg font-mono font-semibold text-foreground">
                                {project.title}
                              </h3>
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {project.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{projectImages.length} images</span>
                              <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(project)}
                                className="flex-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteProject(project.id)}
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  
                  {/* Load More Button */}
                  {projectsWithCoverImages.length > displayLimit && (
                    <div className="col-span-full text-center py-6">
                      <Button
                        onClick={() => setDisplayLimit(prev => prev + 12)}
                        variant="outline"
                        className="px-8"
                      >
                        Load More Projects ({displayLimit} of {projectsWithCoverImages.length})
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit Project Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="images">Project Images</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editProject.title}
                    onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <div className="space-y-2">
                    <Input
                      id="edit-category"
                      value={editProject.category}
                      onChange={(e) => setEditProject({ ...editProject, category: e.target.value })}
                      placeholder="Type a category name (e.g., Commercial, Industrial, or create new)"
                      list="edit-category-suggestions"
                    />
                    <datalist id="edit-category-suggestions">
                      {categories.map(category => (
                        <option key={category.id} value={category.name} />
                      ))}
                    </datalist>
                    <p className="text-xs text-muted-foreground">
                      Type an existing category or create a new one. Existing categories will be auto-completed.
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-year">Year</Label>
                  <Input
                    id="edit-year"
                    value={editProject.year}
                    onChange={(e) => setEditProject({ ...editProject, year: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editProject.description}
                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="edit-featured"
                    type="checkbox"
                    checked={editProject.featured}
                    onChange={(e) => setEditProject({ ...editProject, featured: e.target.checked })}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-offset-0"
                  />
                  <Label htmlFor="edit-featured" className="text-sm font-medium">
                    ⭐ Featured Project
                  </Label>
                  <div className="text-xs text-muted-foreground ml-2">
                    (Will appear on homepage)
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleEditProject} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="space-y-4">
                {editingProject && (
                  <>
                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-foreground">Add Images to Project</h4>
                            <span className="text-sm text-muted-foreground">
                              {getProjectImages(editingProject.id).length} images
                            </span>
                          </div>
                          
                          <div className="p-4 border-2 border-dashed border-border rounded-lg bg-muted/30">
                            <ImageUpload 
                              onUploadComplete={async (imageData) => {
                                try {
                                  const result = await SupabaseContentService.createImage({
                                    name: imageData.name,
                                    url: imageData.url,
                                    category: imageData.category,
                                    project_id: editingProject.id,
                                    file_size: imageData.size || 0,
                                    mime_type: 'image/jpeg',
                                    alt_text: imageData.name,
                                    is_cover_image: false
                                  })
                                  
                                  if (result) {
                                    SupabaseContentService.clearProjectCache()
                                    await loadData()
                                    await refreshContent()
                                    setUploadSuccess(`Image "${imageData.name}" uploaded successfully!`)
                                  } else {
                                    setUploadError('Failed to upload image. Please try again.')
                                  }
                                } catch (error) {
                                  console.error('Error creating image:', error)
                                  setUploadError('Error uploading image: ' + error)
                                }
                              }}
                              defaultCategory={editingProject.category}
                            />
                          </div>
                          
                          {uploadSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-700">{uploadSuccess}</p>
                            </div>
                          )}
                          {uploadError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-700">{uploadError}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-md font-medium text-foreground">Project Images</h5>
                        <span className="text-sm text-muted-foreground">
                          {getProjectImages(editingProject.id).length} total images
                        </span>
                      </div>
                      
                      {getProjectImages(editingProject.id).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-4xl mb-2">📷</div>
                          <p className="text-sm">No images added yet</p>
                          <p className="text-xs">Upload images using the form above</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {getProjectImages(editingProject.id).map((image) => (
                            <Card key={image.id} className="bg-card border-border hover:border-primary/30 transition-all">
                              <CardContent className="p-3">
                                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative rounded-lg mb-3">
                                  {image.url ? (
                                    <img 
                                      src={image.url} 
                                      alt={image.name} 
                                      className="w-full h-full object-cover object-center" 
                                      loading="lazy"
                                      onError={(e) => {
                                        console.error(`Failed to load image: ${image.name}`, e)
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                      }}
                                    />
                                  ) : null}
                                  <div className={`absolute inset-0 flex items-center justify-center text-muted-foreground ${image.url ? 'hidden' : ''}`}>
                                    <div className="text-center">
                                      <div className="text-sm text-muted-foreground">
                                        <div className="text-2xl mb-1">📷</div>
                                        <p className="text-xs">No image data</p>
                                      </div>
                                    </div>
                                  </div>
                                  {image.is_cover_image && (
                                    <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg" />
                                  )}
                                  {image.is_cover_image && (
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                      Cover
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium truncate text-foreground">{image.name}</span>
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                      {image.category}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {!image.is_cover_image ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSetCoverImage(image.id, editingProject.id)}
                                        className="text-xs border-green-300 text-green-600 hover:bg-green-50 px-3 py-1 h-8"
                                      >
                                        <Crown className="w-3 h-3 mr-1" />
                                        Set Cover
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveCoverImage(editingProject.id)}
                                        className="text-xs border-orange-300 text-orange-600 hover:bg-orange-50 px-3 py-1 h-8"
                                      >
                                        <Crown className="w-3 h-3 mr-1" />
                                        Remove Cover
                                      </Button>
                                    )}
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openImageDialog(image)}
                                      className="text-xs px-3 py-1 h-8"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteImage(image.id)}
                                      className="text-xs border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 h-8"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Edit Image Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-name">Name</Label>
                <Input
                  id="image-name"
                  value={editImage.name}
                  onChange={(e) => setEditImage({ ...editImage, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="image-category">Category</Label>
                <Input
                  id="image-category"
                  value={editImage.category}
                  onChange={(e) => setEditImage({ ...editImage, category: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleEditImage} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowImageDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </AdminGuard>
    </div>
  )
})

export default AdminProjectsPage
