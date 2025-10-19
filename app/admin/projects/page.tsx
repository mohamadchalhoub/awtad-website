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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { SupabaseContentService } from "@/lib/supabase-content"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Edit, Trash2, Crown } from "lucide-react"
import type { Tables } from "@/lib/supabase"
import { ImageUpload } from "@/components/image-upload"
import { ProjectsGridSkeleton } from "@/components/loading-skeleton"
import { useContentAdmin } from "@/hooks/use-content"

interface ProjectWithCover extends Tables<'projects'> {
  coverImage?: Tables<'images'> | null
  subProjects?: ProjectWithCover[]
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
    featured: false,
    parent_id: null as number | null,
    isSubProject: false
  })

  const [editProject, setEditProject] = useState({
    title: '',
    category: '',
    year: '',
    description: '',
    featured: false,
    parent_id: null as number | null,
    isSubProject: false
  })

  const [editImage, setEditImage] = useState({
    name: '',
    category: '',
    price: 0
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
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 ADMIN PAGE: Starting optimized data load...')
      console.time('⏱️ ADMIN PAGE - Total Load Time')
      const startTotal = performance.now()
      
      console.log('📡 Fetching projects and categories in parallel...')
      const startFetch = performance.now()
      
      // OPTIMIZED: Only fetch projects and categories (images loaded on-demand)
      const results = await Promise.allSettled([
        SupabaseContentService.getAllProjects(),
        SupabaseContentService.getAllCategories()
      ])
      
      const fetchTime = performance.now() - startFetch
      console.log(`📊 Queries completed in ${fetchTime.toFixed(0)}ms`)
      
      // Extract results
      const projectsData = results[0].status === 'fulfilled' ? results[0].value : []
      const categoriesData = results[1].status === 'fulfilled' ? results[1].value : []
      
      // Log any failures
      if (results[0].status === 'rejected') console.error('❌ Projects query failed:', results[0].reason)
      if (results[1].status === 'rejected') console.error('❌ Categories query failed:', results[1].reason)
      
      console.log('📝 Setting state...')
      const startSetState = performance.now()
      
      setProjects(projectsData)
      setCategories(categoriesData)
      // Don't fetch ALL images - they'll be loaded on-demand when needed
      setImages([])
      
      const setStateTime = performance.now() - startSetState
      console.log(`⚙️ State update took ${setStateTime.toFixed(0)}ms`)
      
      const totalTime = performance.now() - startTotal
      console.timeEnd('⏱️ ADMIN PAGE - Total Load Time')
      
      console.log(`
╔════════════════════════════════════════════════╗
║  🚀 ADMIN PAGE LOAD (OPTIMIZED)                ║
╠════════════════════════════════════════════════╣
║  📊 Projects: ${projectsData.length.toString().padEnd(4)} items                        ║
║  📁 Categories: ${categoriesData.length.toString().padEnd(4)} items                    ║
╠════════════════════════════════════════════════╣
║  ⏱️  Fetch time: ${fetchTime.toFixed(0).padEnd(6)}ms                      ║
║  ⚙️  State update: ${setStateTime.toFixed(0).padEnd(6)}ms                    ║
║  🎯 TOTAL TIME: ${totalTime.toFixed(0).padEnd(6)}ms                      ║
╚════════════════════════════════════════════════╝
      `)
      
      if (totalTime < 2000) {
        console.log('✅ EXCELLENT: <2s load time!')
      } else if (totalTime < 3000) {
        console.log('✅ GOOD: <3s load time')
      } else {
        console.warn('⚠️ SLOW: Check indexes and Supabase region')
      }
      
    } catch (error) {
      console.error('❌❌❌ FATAL ERROR in loadData:', error)
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
          // Update categories state without full refresh
          setCategories(prev => [...prev, newCategory])
        }
      }

      // If it's a subproject, it cannot be featured
      const projectData: any = {
        title: newProject.title,
        category: categoryToUse,
        year: newProject.year,
        description: newProject.description,
        is_active: true,
        parent_id: newProject.isSubProject ? newProject.parent_id : null,
        featured: newProject.isSubProject ? false : newProject.featured
      }

      const result = await SupabaseContentService.createProject(projectData)

      if (result) {
        // Update projects state without full refresh
        setProjects(prev => [...prev, result])
        setShowAddDialog(false)
        setNewProject({ title: '', category: '', year: '', description: '', featured: false, parent_id: null, isSubProject: false })
        SupabaseContentService.clearProjectCache()
        setUploadSuccess(`Project "${result.title}" created successfully!`)
      }
    } catch (error) {
      setError('Error adding project: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
          // Update categories state without full refresh
          setCategories(prev => [...prev, newCategory])
        }
      }

      // If it's a subproject, it cannot be featured
      const updateData: any = {
         title: editProject.title,
         category: categoryToUse,
         year: editProject.year,
         description: editProject.description,
        parent_id: editProject.isSubProject ? editProject.parent_id : null,
        featured: editProject.isSubProject ? false : editProject.featured
      }

      const result = await SupabaseContentService.updateProject(editingProject.id, updateData)

      if (result) {
        // Update projects state without full refresh
        setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...updateData } : p))
        setShowEditDialog(false)
        setEditingProject(null)
        setEditProject({ title: '', category: '', year: '', description: '', featured: false, parent_id: null, isSubProject: false })
        SupabaseContentService.clearProjectCache()
        setUploadSuccess(`Project "${result.title}" updated successfully!`)
      }
    } catch (error) {
      setError('Error updating project: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const result = await SupabaseContentService.deleteProject(projectId)
        if (result) {
          // Update projects state without full refresh
          setProjects(prev => prev.filter(p => p.id !== projectId))
          // Also remove any images associated with this project
          setImages(prev => prev.filter(img => img.project_id !== projectId))
          SupabaseContentService.clearProjectCache()
          setUploadSuccess('Project deleted successfully!')
        }
      } catch (error) {
        setError('Error deleting project: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
  }

  const handleEditImage = async () => {
    if (!editingImage) return

    // Validate price
    if (editImage.price < 0) {
      setError("Price must be a positive number!")
      return
    }

    try {
      const result = await SupabaseContentService.updateImage(editingImage.id, {
        name: editImage.name,
        category: editImage.category,
        price: editImage.price
      })

      if (result) {
        // Update images state without full refresh
        setImages(prev => prev.map(img => img.id === editingImage.id ? { ...img, ...editImage } : img))
        setShowImageDialog(false)
        setEditingImage(null)
        setEditImage({ name: '', category: '', price: 0 })
        SupabaseContentService.clearProjectCache()
        setUploadSuccess(`Image "${editImage.name}" updated successfully!`)
      }
    } catch (error) {
      setError('Error updating image: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image? If it\'s being used as a cover image, it will be removed from projects first.')) {
      try {
        console.log('Attempting to delete image with ID:', imageId)
        const result = await SupabaseContentService.deleteImage(imageId)
        if (result) {
          console.log('Image deleted successfully')
          // Update images state without full refresh
          setImages(prev => prev.filter(img => img.id !== imageId))
          // Also update projects to remove cover_image_id if this was a cover image
          setProjects(prev => prev.map(project => 
            project.cover_image_id === imageId 
              ? { ...project, cover_image_id: null }
              : project
          ))
          SupabaseContentService.clearProjectCache()
          setUploadSuccess('Image deleted successfully! If it was a cover image, it has been removed from projects.')
        } else {
          console.error('Failed to delete image - result was false')
          setError('Failed to delete image. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
        setError('Error deleting image: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
  }

  const handleSetCoverImage = async (imageId: string, projectId: number) => {
    try {
      const result = await SupabaseContentService.setCoverImage(imageId, projectId)
      if (result) {
        // Update projects state without full refresh
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { ...project, cover_image_id: imageId }
            : project
        ))
        SupabaseContentService.clearProjectCache()
        await refreshContent()
        setUploadSuccess('Cover image set successfully! It will now appear on public pages.')
      } else {
        setUploadError('Failed to set cover image. Please try again.')
      }
    } catch (error) {
      setUploadError('Error setting cover image: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleRemoveCoverImage = async (projectId: number) => {
    try {
      const result = await SupabaseContentService.updateProject(projectId, {
        cover_image_id: null
      })
      if (result) {
        // Update projects state without full refresh
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { ...project, cover_image_id: null }
            : project
        ))
        SupabaseContentService.clearProjectCache()
        setUploadSuccess('Cover image removed successfully!')
      }
    } catch (error) {
      setError('Error removing cover image: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const openEditDialog = (project: Tables<'projects'>) => {
    // Opening edit dialog for project
    // Project featured status: (project as any).featured
    setEditingProject(project)
    setEditProject({
      title: project.title,
      category: project.category,
      year: project.year,
      description: project.description,
      featured: Boolean((project as Record<string, unknown>).featured),
      parent_id: project.parent_id,
      isSubProject: project.parent_id !== null
    })
    setShowEditDialog(true)
  }

  const openImageDialog = (image: Tables<'images'>) => {
    setEditingImage(image)
    setEditImage({
      name: image.name,
      category: image.category,
      price: image.price || 0
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

  // Group projects by parent (for displaying hierarchy)
  const groupedProjects = useMemo(() => {
    const parentProjects = projectsWithCoverImages.filter(p => !p.parent_id)
    const result: ProjectWithCover[] = []
    
    parentProjects.forEach(parent => {
      const subProjects = projectsWithCoverImages.filter(p => p.parent_id === parent.id)
      result.push({ ...parent, subProjects } as ProjectWithCover)
    })
    
    return result
  }, [projectsWithCoverImages])

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
                  onClick={() => loadData()}
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
                  <Button className="gold-gradient text-primary-foreground hover:opacity-90 h-9 px-4 text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Add New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="title" className="text-xs font-medium">Title</Label>
                      <Input
                        id="title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        placeholder="Project title"
                          className="h-9 text-sm"
                      />
                    </div>
                    <div>
                        <Label htmlFor="year" className="text-xs font-medium">Year</Label>
                        <Input
                          id="year"
                          value={newProject.year}
                          onChange={(e) => setNewProject({ ...newProject, year: e.target.value })}
                          placeholder="2024"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-xs font-medium">Category</Label>
                        <Input
                          id="category"
                          value={newProject.category}
                          onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                        placeholder="e.g., Commercial, Industrial"
                          list="category-suggestions"
                        className="h-9 text-sm"
                        />
                        <datalist id="category-suggestions">
                          {categories.map(category => (
                            <option key={category.id} value={category.name} />
                          ))}
                        </datalist>
                      </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder="Project description"
                        rows={2}
                        className="text-sm resize-none"
                      />
                    </div>
                    
                    {/* Parent/Subproject Selection */}
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between bg-muted/30 p-2 rounded">
                        <Label htmlFor="isSubProject" className="text-xs font-medium">
                          Is this a subproject?
                        </Label>
                        <Switch
                          id="isSubProject"
                          checked={newProject.isSubProject}
                          onCheckedChange={(checked) => setNewProject({ ...newProject, isSubProject: checked, featured: checked ? false : newProject.featured })}
                        />
                      </div>
                      
                      {newProject.isSubProject && (
                        <div>
                          <Label htmlFor="parent-project" className="text-xs font-medium">Parent Project</Label>
                          <Select 
                            value={newProject.parent_id?.toString() || ''} 
                            onValueChange={(value) => setNewProject({ ...newProject, parent_id: parseInt(value) })}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Select a parent project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.filter(p => !p.parent_id).map(project => (
                                <SelectItem key={project.id} value={project.id.toString()}>
                                  {project.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {!newProject.isSubProject && (
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded">
                      <input
                        id="featured"
                        type="checkbox"
                        checked={newProject.featured}
                        onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                            className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-primary focus:ring-offset-0"
                      />
                          <Label htmlFor="featured" className="text-xs font-medium cursor-pointer">
                            ⭐ Featured on homepage
                      </Label>
                      </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button type="button" onClick={handleAddProject} className="flex-1 h-9 text-sm">
                        Add Project
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1 h-9 text-sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>



            <div className="space-y-3">
              {loading ? (
                // Loading skeleton
                        <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="bg-card border border-border rounded-lg p-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-muted rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        <div className="flex gap-2">
                          <div className="w-16 h-8 bg-muted rounded"></div>
                          <div className="w-16 h-8 bg-muted rounded"></div>
                        </div>
                        </div>
                        </div>
                  ))}
                      </div>
              ) : groupedProjects.length === 0 ? (
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
                      type="button"
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
                  {groupedProjects.slice(0, displayLimit).map((parentProject) => {
                    const projectImages = getProjectImages(parentProject.id)
                    const coverImage = parentProject.coverImage
                    
                    return (
                      <div key={parentProject.id} className="space-y-1">
                        {/* Parent Project - Compact Row */}
                        <div className="bg-card border border-border rounded-lg hover:border-primary/30 transition-all group">
                          <div className="flex items-center gap-3 p-3">
                            {/* Thumbnail */}
                            <div className="w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden relative">
                            {coverImage && coverImage.url ? (
                              <img 
                                src={coverImage.url} 
                                alt={coverImage.name} 
                                  className="w-full h-full object-cover" 
                                loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                                  🏗️
                              </div>
                              )}
                              {parentProject.featured && (
                                <div className="absolute top-0.5 left-0.5 bg-yellow-500 text-white text-[10px] px-1 py-0.5 rounded">
                                  ⭐
                              </div>
                            )}
                          </div>
                            
                            {/* Project Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-400 text-sm">📁</span>
                                <h3 className="font-semibold text-sm text-foreground truncate">
                                  {parentProject.title}
                                </h3>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  {parentProject.category}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {parentProject.year}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                {parentProject.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{projectImages.length} images</span>
                                {parentProject.subProjects && parentProject.subProjects.length > 0 && (
                                  <span>• {parentProject.subProjects.length} subprojects</span>
                                )}
                                <span>• {new Date(parentProject.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(parentProject)}
                                className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteProject(parentProject.id)}
                                className="h-8 px-3 text-xs hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Subprojects - Compact Nested Rows */}
                        {parentProject.subProjects && parentProject.subProjects.length > 0 && (
                          <div className="ml-8 space-y-1">
                            {parentProject.subProjects.map((subProject) => {
                              const subProjectImages = getProjectImages(subProject.id)
                              const subCoverImage = subProject.coverImage
                              
                              return (
                                <div key={subProject.id} className="bg-card/50 border border-border/50 rounded-lg hover:border-primary/20 transition-all group">
                                  <div className="flex items-center gap-3 p-2.5">
                                    {/* Thumbnail - smaller */}
                                    <div className="w-14 h-14 flex-shrink-0 bg-muted rounded overflow-hidden">
                                      {subCoverImage && subCoverImage.url ? (
                                        <img 
                                          src={subCoverImage.url} 
                                          alt={subCoverImage.name} 
                                          className="w-full h-full object-cover" 
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                                          📄
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Subproject Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-gray-400 text-xs">↳</span>
                                        <h4 className="font-medium text-xs text-foreground truncate">
                                          {subProject.title}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                          {subProject.category}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                          {subProject.year}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-muted-foreground line-clamp-1 mb-0.5">
                                        {subProject.description}
                                      </p>
                                      <div className="text-[10px] text-muted-foreground">
                                        {subProjectImages.length} images
                                      </div>
                                    </div>
                                    
                                    {/* Actions - smaller */}
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openEditDialog(subProject)}
                                        className="h-7 px-2 text-[11px] hover:bg-primary/10 hover:text-primary"
                                      >
                                        <Edit className="w-3 h-3 mr-0.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteProject(subProject.id)}
                                        className="h-7 px-2 text-[11px] hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Trash2 className="w-3 h-3 mr-0.5" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Load More Button */}
                  {groupedProjects.length > displayLimit && (
                    <div className="text-center py-6">
                      <Button
                        type="button"
                        onClick={() => setDisplayLimit(prev => prev + 12)}
                        variant="outline"
                        className="px-8"
                      >
                        Load More Projects ({displayLimit} of {groupedProjects.length})
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
              
              <TabsContent value="details" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="edit-title" className="text-xs font-medium">Title</Label>
                  <Input
                    id="edit-title"
                    value={editProject.title}
                    onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                      className="h-9 text-sm"
                  />
                </div>
                <div>
                    <Label htmlFor="edit-year" className="text-xs font-medium">Year</Label>
                    <Input
                      id="edit-year"
                      value={editProject.year}
                      onChange={(e) => setEditProject({ ...editProject, year: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-category" className="text-xs font-medium">Category</Label>
                    <Input
                      id="edit-category"
                      value={editProject.category}
                      onChange={(e) => setEditProject({ ...editProject, category: e.target.value })}
                    placeholder="e.g., Commercial, Industrial"
                      list="edit-category-suggestions"
                    className="h-9 text-sm"
                    />
                    <datalist id="edit-category-suggestions">
                      {categories.map(category => (
                        <option key={category.id} value={category.name} />
                      ))}
                    </datalist>
                  </div>
                
                <div>
                  <Label htmlFor="edit-description" className="text-xs font-medium">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editProject.description}
                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
                
                {/* Parent/Subproject Selection */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded">
                    <Label htmlFor="edit-isSubProject" className="text-xs font-medium">
                      Is this a subproject?
                    </Label>
                    <Switch
                      id="edit-isSubProject"
                      checked={editProject.isSubProject}
                      onCheckedChange={(checked) => setEditProject({ ...editProject, isSubProject: checked, featured: checked ? false : editProject.featured })}
                    />
                  </div>
                  
                  {editProject.isSubProject && (
                    <div>
                      <Label htmlFor="edit-parent-project" className="text-xs font-medium">Parent Project</Label>
                      <Select 
                        value={editProject.parent_id?.toString() || ''} 
                        onValueChange={(value) => setEditProject({ ...editProject, parent_id: parseInt(value) })}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select a parent project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.filter(p => !p.parent_id && p.id !== editingProject?.id).map(project => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {!editProject.isSubProject && (
                    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded">
                  <input
                    id="edit-featured"
                    type="checkbox"
                    checked={editProject.featured}
                    onChange={(e) => setEditProject({ ...editProject, featured: e.target.checked })}
                        className="w-3.5 h-3.5 text-primary bg-background border-border rounded focus:ring-primary focus:ring-offset-0"
                  />
                      <Label htmlFor="edit-featured" className="text-xs font-medium cursor-pointer">
                        ⭐ Featured on homepage
                  </Label>
                  </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button type="button" onClick={handleEditProject} className="flex-1 h-9 text-sm">
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1 h-9 text-sm">
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
                                  // Update the image with the project_id since it was already created
                                  const result = await SupabaseContentService.updateImage(imageData.id, {
                                    project_id: editingProject.id
                                  })
                                  
                                  if (result) {
                                    // Update images state without full refresh
                                    setImages(prev => prev.map(img => 
                                      img.id === imageData.id 
                                        ? { ...img, project_id: editingProject.id }
                                        : img
                                    ))
                                    SupabaseContentService.clearProjectCache()
                                    await refreshContent()
                                    setUploadSuccess(`Image "${imageData.name}" uploaded successfully!`)
                                  } else {
                                    setUploadError('Failed to link image to project. Please try again.')
                                  }
                                } catch (error) {
                                  setUploadError('Error linking image to project: ' + (error instanceof Error ? error.message : 'Unknown error'))
                                }
                              }}
                              projectId={editingProject.id}
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
                                      // Failed to load image
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
                                        type="button"
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
                                        type="button"
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
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openImageDialog(image)}
                                      className="text-xs px-3 py-1 h-8"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    
                                    <Button
                                      type="button"
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
              <div>
                <Label htmlFor="image-price">Price (USD)</Label>
                <Input
                  id="image-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editImage.price}
                  onChange={(e) => setEditImage({ ...editImage, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="button" onClick={handleEditImage} className="flex-1">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowImageDialog(false)} className="flex-1">
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
