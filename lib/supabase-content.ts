import { supabase } from './supabase'
import type { Tables, InsertDto, UpdateDto } from './supabase'

export class SupabaseContentService {
  // Cache for storing fetched data
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_DURATION = 5 * 60 * 1000 // Increased to 5 minutes for better performance

  // Clear expired cache entries
  private static clearExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }

  // Get cached data if available and not expired
  private static getCachedData(key: string): any | null {
    this.clearExpiredCache()
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  // Set data in cache
  private static setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // Clear specific cache entry
  static clearCache(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  // Clear all project and image related cache
  static clearProjectCache() {
    this.cache.delete('all_projects')
    this.cache.delete('all_images')
    // Clear featured projects cache as well
    for (const [key] of this.cache.entries()) {
      if (key.startsWith('featured_projects_')) {
        this.cache.delete(key)
      }
    }
  }

  // Test database connection - removed from main flow for performance
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('count')
        .limit(1)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Projects
  static async getAllProjects(): Promise<Tables<'projects'>[]> {
    // Check cache first
    const cacheKey = 'all_projects'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }

    const result = data || []
    // Cache the result
    this.setCachedData(cacheKey, result)
    return result
  }

  static async getProjectById(id: number): Promise<Tables<'projects'> | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return data
  }

  static async createProject(project: InsertDto<'projects'>): Promise<Tables<'projects'> | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return null
    }

    // Clear cache after creating project
    this.clearProjectCache()
    return data
  }

  static async updateProject(id: number, updates: UpdateDto<'projects'>): Promise<Tables<'projects'> | null> {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return null
    }

    // Clear cache after updating project
    this.clearProjectCache()
    return data
  }

  static async deleteProject(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      return false
    }

    // Clear cache after deleting project
    this.clearProjectCache()
    return true
  }

  // Get featured projects for homepage
  static async getFeaturedProjects(limit: number = 6): Promise<Tables<'projects'>[]> {
    const cacheKey = `featured_projects_${limit}`
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching featured projects:', error)
        return []
      }

      const result = data || []
      this.setCachedData(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error in getFeaturedProjects:', error)
      return []
    }
  }

  // Images
  static async getAllImages(): Promise<Tables<'images'>[]> {
    // Check cache first
    const cacheKey = 'all_images'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching images:', error)
      return []
    }

    const result = data || []
    // Cache the result
    this.setCachedData(cacheKey, result)
    return result
  }

  static async getImagesByProject(projectId: number): Promise<Tables<'images'>[]> {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching project images:', error)
      return []
    }

    return data || []
  }

  static async getImagesByCategory(category: string): Promise<Tables<'images'>[]> {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching category images:', error)
      return []
    }

    return data || []
  }

  static async createImage(image: InsertDto<'images'>): Promise<Tables<'images'> | null> {
    const { data, error } = await supabase
      .from('images')
      .insert(image)
      .select()
      .single()

    if (error) {
      console.error('Error creating image:', error)
      return null
    }

    // Clear cache after creating image
    this.clearProjectCache()
    return data
  }

  static async updateImage(id: string, updates: UpdateDto<'images'>): Promise<Tables<'images'> | null> {
    const { data, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating image:', error)
      return null
    }

    // Clear cache after updating image
    this.clearProjectCache()
    return data
  }

  static async deleteImage(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    // Clear cache after deleting image
    this.clearProjectCache()
    return true
  }

  static async setCoverImage(imageId: string, projectId: number): Promise<boolean> {
    try {
      // First, remove cover flag from all other images in the project
      const { error: updateError } = await supabase
        .from('images')
        .update({ is_cover_image: false })
        .eq('project_id', projectId)

      if (updateError) {
        console.error('Error removing cover flags:', updateError)
        return false
      }

      // Then set the new cover image
      const { error: imageError } = await supabase
        .from('images')
        .update({ is_cover_image: true })
        .eq('id', imageId)

      if (imageError) {
        console.error('Error setting cover image:', imageError)
        return false
      }

      // Finally, update the project's cover_image_id
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          cover_image_id: imageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (projectError) {
        console.error('Error updating project cover_image_id:', projectError)
        return false
      }

      // Clear cache after setting cover image
      this.clearProjectCache()
      return true
    } catch (error) {
      console.error('Error in setCoverImage:', error)
      return false
    }
  }

  // Homepage Content
  static async getHomepageContent(): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('homepage_content')
      .select('*')

    if (error) {
      console.error('Error fetching homepage content:', error)
      return {}
    }

    const content: Record<string, any> = {}
    data?.forEach(item => {
      if (item.section_name === 'hero') {
        content.hero = {
          title: item.title || '',
          subtitle: item.subtitle || '',
          description: item.description || ''
        }
      } else if (item.section_name === 'services') {
        content.services = {
          services: item.content?.services || []
        }
      }
    })

    return content
  }

  static async updateHomepageContent(section: string, content: any): Promise<boolean> {
    try {
      // First, check if the record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('section_name', section)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing record:', fetchError)
        return false
      }

      let updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (section === 'hero') {
        updateData = {
          ...updateData,
          title: content.title || '',
          subtitle: content.subtitle || '',
          description: content.description || ''
        }
      } else if (section === 'services') {
        updateData = {
          ...updateData,
          content: { services: content.services || [] }
        }
      }

      let result
      if (existingRecord) {
        // Record exists, UPDATE it
        result = await supabase
          .from('homepage_content')
          .update(updateData)
          .eq('section_name', section)
          .select()
      } else {
        // Record doesn't exist, INSERT it
        result = await supabase
          .from('homepage_content')
          .insert({
            section_name: section,
            ...updateData
          })
          .select()
      }

      if (result.error) {
        console.error('Supabase error updating homepage content:', result.error)
        console.error('Error details:', {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint
        })
        console.error('Full error object:', JSON.stringify(result.error, null, 2))
        return false
      }

      return true
    } catch (error) {
      console.error('Unexpected error in updateHomepageContent:', error)
      return false
    }
  }

  // About Content
  static async getAboutContent(): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('about_content')
      .select('*')

    if (error) {
      console.error('Error fetching about content:', error)
      return {}
    }

    const content: Record<string, any> = {}
    data?.forEach(item => {
      if (item.section_name === 'story') {
        content.story = {
          content: item.content || ''
        }
      } else if (item.section_name === 'values') {
        content.values = {
          values: item.additional_data?.values || []
        }
      } else if (item.section_name === 'team') {
        content.team = {
          team: item.additional_data?.team || []
        }
      }
    })

    return content
  }

  static async updateAboutContent(section: string, content: any): Promise<boolean> {
    try {
      // First, check if the record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('about_content')
        .select('*')
        .eq('section_name', section)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing record:', fetchError)
        return false
      }

      let updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (section === 'story') {
        updateData = {
          ...updateData,
          content: content.content || ''
        }
      } else if (section === 'values') {
        updateData = {
          ...updateData,
          additional_data: { values: content.values || [] }
        }
      } else if (section === 'team') {
        updateData = {
          ...updateData,
          additional_data: { team: content.team || [] }
        }
      }

      let result
      if (existingRecord) {
        // Record exists, UPDATE it
        result = await supabase
          .from('about_content')
          .update(updateData)
          .eq('section_name', section)
          .select()
      } else {
        // Record doesn't exist, INSERT it
        result = await supabase
          .from('about_content')
          .insert({
            section_name: section,
            ...updateData
          })
          .select()
      }

      if (result.error) {
        console.error('Supabase error updating about content:', result.error)
        console.error('Error details:', {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint
        })
        console.error('Full error object:', JSON.stringify(result.error, null, 2))
        return false
      }

      return true
    } catch (error) {
      console.error('Unexpected error in updateAboutContent:', error)
      return false
    }
  }

  // Categories
  static async getAllCategories(): Promise<Tables<'categories'>[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  }

  static async createCategory(category: InsertDto<'categories'>): Promise<Tables<'categories'> | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return null
    }

    return data
  }

  static async deleteCategory(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return false
    }

    return true
  }

  // Get projects with cover images (for admin page)
  static async getProjectsWithCoverImages(): Promise<Array<Tables<'projects'> & { cover_image_url?: string }>> {
    const cacheKey = 'projects_with_covers'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      // First, get all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (projectsError) {
        console.error('Error fetching projects:', projectsError)
        return []
      }

      if (!projectsData || projectsData.length === 0) {
        return []
      }

      // Then, get cover images for projects that have them
      const projectIdsWithCover = projectsData
        .filter(project => project.cover_image_id)
        .map(project => project.cover_image_id)

      let coverImages: any[] = []
      if (projectIdsWithCover.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from('images')
          .select('id, url')
          .in('id', projectIdsWithCover)

        if (imagesError) {
          console.error('Error fetching cover images:', imagesError)
        } else {
          coverImages = imagesData || []
        }
      }

      // Create a map for quick lookup
      const coverImageMap = new Map(coverImages.map(img => [img.id, img.url]))

      // Combine projects with their cover images
      const result = projectsData.map(project => ({
        ...project,
        cover_image_url: project.cover_image_id ? coverImageMap.get(project.cover_image_id) : undefined
      }))

      this.setCachedData(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error in getProjectsWithCoverImages:', error)
      return []
    }
  }
}
