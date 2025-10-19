import { supabase } from './supabase'
import type { Tables, InsertDto, UpdateDto } from './supabase'

export class SupabaseContentService {
  // AGGRESSIVE IN-MEMORY CACHE for tiny database (6 projects + 8 images = instant)
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 MINUTES - aggressive caching for small dataset
  private static MAX_CACHE_SIZE = 200 // More than enough for tiny database

  // Clear expired cache entries (rarely needed with 5min cache)
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
    const cached = this.cache.get(key)
    if (cached) {
      const age = Date.now() - cached.timestamp
      if (age < this.CACHE_DURATION) {
        console.log(`✅ CACHE HIT: ${key} (age: ${(age / 1000).toFixed(1)}s) - INSTANT!`)
        return cached.data
      } else {
        console.log(`⏰ Cache expired: ${key} (age: ${(age / 1000).toFixed(1)}s)`)
        this.cache.delete(key)
      }
    }
    return null
  }

  // Set data in cache with size limit
  private static setCachedData(key: string, data: any) {
    // Clear oldest entries if cache is too large (very unlikely with 6 projects + 8 images)
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
    this.cache.set(key, { data, timestamp: Date.now() })
    console.log(`💾 CACHED: ${key} (${data?.length || 0} items) - subsequent loads will be INSTANT`)
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
    this.cache.delete('parent_projects_with_subprojects')
    this.cache.delete('parent_projects')
    // Clear featured projects cache as well
    for (const [key] of this.cache.entries()) {
      if (key.startsWith('featured_projects_') || key.startsWith('subprojects_')) {
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

  // Projects (6 projects total - should be instant)
  static async getAllProjects(): Promise<Tables<'projects'>[]> {
    const cacheKey = 'all_projects'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) return cachedData

    const startTime = performance.now()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(`❌ Error fetching projects:`, error)
      return []
    }

    const result = data || []
    const queryTime = performance.now() - startTime
    console.log(`📊 getAllProjects: ${result.length} projects in ${queryTime.toFixed(0)}ms`)
    
    if (queryTime > 500) {
      console.warn(`⚠️ SLOW: getAllProjects took ${queryTime.toFixed(0)}ms (expected <500ms for 6 projects)`)
    }
    
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

  // Get featured projects for homepage (only parent projects)
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
        .is('parent_id', null) // Only parent projects can be featured
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

  // Get parent projects (projects without a parent_id)
  static async getParentProjects(): Promise<Tables<'projects'>[]> {
    const cacheKey = 'parent_projects'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching parent projects:', error)
        return []
      }

      const result = data || []
      this.setCachedData(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error in getParentProjects:', error)
      return []
    }
  }

  // Get subprojects for a parent project
  static async getSubProjects(parentId: number): Promise<Tables<'projects'>[]> {
    const cacheKey = `subprojects_${parentId}`
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching subprojects:', error)
        return []
      }

      const result = data || []
      this.setCachedData(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error in getSubProjects:', error)
      return []
    }
  }

  // Get subprojects with pagination for modal
  static async getSubProjectsPaginated(
    parentId: number, 
    limit: number = 20, 
    offset: number = 0, 
    search: string = '', 
    sort: string = 'newest'
  ): Promise<{ items: any[]; total: number; hasMore: boolean }> {
    try {
      // Build query without joins to avoid issues
      let query = supabase
        .from('projects')
        .select('id, title, created_at, cover_image_id', { count: 'exact' })
        .eq('is_active', true)
        .eq('parent_id', parentId)

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Apply sorting
      switch (sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'title':
          query = query.order('title', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching paginated subprojects:', error)
        console.error('Error details:', error.message, error.details)
        return { items: [], total: 0, hasMore: false }
      }

      // Get cover images for subprojects that have them
      const coverImageIds = data
        ?.filter(project => project.cover_image_id)
        .map(project => project.cover_image_id) || []

      let coverImages: any[] = []
      if (coverImageIds.length > 0) {
        const { data: coverImagesData, error: coverImagesError } = await supabase
          .from('images')
          .select('id, url')
          .in('id', coverImageIds)

        if (coverImagesError) {
          console.error('Error fetching cover images:', coverImagesError)
        } else {
          coverImages = coverImagesData || []
        }
      }

      // Create map for quick lookup
      const coverImageMap = new Map(coverImages.map(img => [img.id, img.url]))

      // Transform data to include thumbnail_url
      const items = data?.map(project => ({
        id: project.id,
        title: project.title,
        slug: project.id.toString(), // Use id as slug since slug column doesn't exist
        thumbnail_url: project.cover_image_id ? coverImageMap.get(project.cover_image_id) : undefined,
        created_at: project.created_at
      })) || []

      return {
        items,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    } catch (error) {
      console.error('Error in getSubProjectsPaginated:', error)
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      return { items: [], total: 0, hasMore: false }
    }
  }

  // FALLBACK: Optimized parallel queries (6 projects + 8 images = should be instant)
  private static async getParentProjectsWithSubprojectsFallback(): Promise<Array<Tables<'projects'> & { 
    cover_image_url?: string;
    subprojectsCount: number; 
    subprojectsPreview: Array<{ id: number; title: string; slug: string; thumbnail_url?: string; created_at: string }> 
  }>> {
    try {
      const startTotal = performance.now()
      
      // Step 1: Fetch parent projects (should be <100ms for 6 projects)
      const { data: parentProjects, error: parentError } = await supabase
        .from('projects')
        .select('id, title, category, description, year, cover_image_id, created_at, featured, parent_id, is_active, updated_at, created_by')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (parentError || !parentProjects || parentProjects.length === 0) {
        console.error('❌ No parent projects found:', parentError)
        return []
      }

      // Step 2: Fetch subprojects and images in PARALLEL
      const parentIds = parentProjects.map(p => p.id)
      const parentCoverImageIds = parentProjects.filter(p => p.cover_image_id).map(p => p.cover_image_id!)

      const [subprojectsResult, coverImagesResult] = await Promise.allSettled([
        supabase
          .from('projects')
          .select('id, title, parent_id, cover_image_id, created_at')
          .eq('is_active', true)
          .in('parent_id', parentIds)
          .order('created_at', { ascending: false }),
        
        parentCoverImageIds.length > 0
          ? supabase.from('images').select('id, url').in('id', parentCoverImageIds)
          : Promise.resolve({ data: [], error: null })
      ])

      const allSubprojects = subprojectsResult.status === 'fulfilled' ? (subprojectsResult.value.data || []) : []
      let coverImagesMap = new Map<string, string>()
      
      if (coverImagesResult.status === 'fulfilled' && coverImagesResult.value.data) {
        coverImagesMap = new Map(coverImagesResult.value.data.map(img => [img.id, img.url]))
      }

      // Step 3: Fetch subproject cover images if needed
      const subprojectCoverImageIds = allSubprojects.filter(sp => sp.cover_image_id).map(sp => sp.cover_image_id!)
      const newImageIds = subprojectCoverImageIds.filter(id => !coverImagesMap.has(id))
      
      if (newImageIds.length > 0) {
        const { data: subImages } = await supabase
          .from('images')
          .select('id, url')
          .in('id', newImageIds)
        
        if (subImages) {
          subImages.forEach(img => coverImagesMap.set(img.id, img.url))
        }
      }

      // Step 4: Combine data (in-memory, instant)
      const subprojectsByParent = new Map<number, any[]>()
      allSubprojects.forEach(subproject => {
        const parentId = subproject.parent_id!
        if (!subprojectsByParent.has(parentId)) {
          subprojectsByParent.set(parentId, [])
        }
        subprojectsByParent.get(parentId)!.push({
          id: subproject.id,
          title: subproject.title,
          slug: subproject.id.toString(),
          thumbnail_url: subproject.cover_image_id ? coverImagesMap.get(subproject.cover_image_id) : undefined,
          created_at: subproject.created_at
        })
      })

      const result = parentProjects.map(project => {
        const subprojects = subprojectsByParent.get(project.id) || []
        return {
          ...project,
          cover_image_url: project.cover_image_id ? coverImagesMap.get(project.cover_image_id) : undefined,
          subprojectsCount: subprojects.length,
          subprojectsPreview: subprojects.slice(0, 6)
        }
      })

      const totalTime = performance.now() - startTotal
      console.log(`📊 getParentProjectsWithSubprojects: ${result.length} parents + ${allSubprojects.length} subprojects in ${totalTime.toFixed(0)}ms`)
      
      if (totalTime > 1000) {
        console.warn(`⚠️ SLOW: Query took ${totalTime.toFixed(0)}ms (expected <1s for tiny database)`)
      }

      return result
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error)
      return []
    }
  }

  // Get parent projects with subprojects count and preview
  // Using separate optimized queries (joined queries don't work without proper FK configuration)
  static async getParentProjectsWithSubprojects(): Promise<Array<Tables<'projects'> & { 
    cover_image_url?: string;
    subprojectsCount: number; 
    subprojectsPreview: Array<{ id: number; title: string; slug: string; thumbnail_url?: string; created_at: string }> 
  }>> {
    const cacheKey = 'parent_projects_with_subprojects'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      console.log('✅ Public projects loaded from cache (instant)')
      return cachedData
    }

    // Use the working fallback method as primary
    return this.getParentProjectsWithSubprojectsFallback()
  }

  // Images (8 images total - but URLs are 18MB of base64 data!)
  // CRITICAL: Do NOT fetch 'url' field - it contains base64-encoded images (1-8 MB each!)
  static async getAllImages(): Promise<Tables<'images'>[]> {
    const cacheKey = 'all_images'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) return cachedData

    const startTime = performance.now()
    // IMPORTANT: Only fetch metadata, NOT the url field (contains 18MB of base64 data!)
    const { data, error } = await supabase
      .from('images')
      .select('id, name, category, project_id, created_at, is_cover_image, alt_text, file_size, mime_type, price, created_by, upload_date')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching images:', error)
      return []
    }

    const result = data || []
    const queryTime = performance.now() - startTime
    console.log(`📊 getAllImages (metadata only): ${result.length} images in ${queryTime.toFixed(0)}ms`)
    
    if (queryTime > 500) {
      console.warn(`⚠️ SLOW: getAllImages took ${queryTime.toFixed(0)}ms (expected <500ms)`)
    }
    
    this.setCachedData(cacheKey, result)
    return result as any // Type assertion since we're not fetching url
  }

  static async getImagesByProject(projectId: number): Promise<Tables<'images'>[]> {
    // Fetch WITH url field since we need to display them (but warn about performance)
    console.log(`⚠️ Fetching images for project ${projectId} - may be slow due to 18MB base64 data`)
    const startTime = performance.now()
    
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    const queryTime = performance.now() - startTime
    console.log(`📊 Fetched ${data?.length || 0} images for project in ${queryTime.toFixed(0)}ms`)

    if (error) {
      console.error('Error fetching project images:', error)
      return []
    }

    return data || []
  }

  static async getImagesByCategory(category: string): Promise<Tables<'images'>[]> {
    // Fetch WITH url field since we need to display them
    console.log(`⚠️ Fetching images for category ${category} - may be slow due to 18MB base64 data`)
    const startTime = performance.now()
    
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    const queryTime = performance.now() - startTime
    console.log(`📊 Fetched ${data?.length || 0} images for category in ${queryTime.toFixed(0)}ms`)

    if (error) {
      console.error('Error fetching category images:', error)
      return []
    }

    return data || []
  }

  static async getImagesByIds(imageIds: string[]): Promise<Tables<'images'>[]> {
    if (imageIds.length === 0) return []
    
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .in('id', imageIds)

    if (error) {
      console.error('Error fetching images by IDs:', error)
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
    try {
      // First, check if this image is being used as a cover image
      const { data: projectsUsingImage, error: checkError } = await supabase
        .from('projects')
        .select('id, title')
        .eq('cover_image_id', id)

      if (checkError) {
        console.error('Error checking if image is used as cover:', checkError)
        return false
      }

      // If the image is being used as a cover image, remove it from projects first
      if (projectsUsingImage && projectsUsingImage.length > 0) {
        console.log(`Image is being used as cover image for ${projectsUsingImage.length} project(s). Removing cover image references first.`)
        
        // Remove cover_image_id from all projects using this image
        const { error: updateError } = await supabase
          .from('projects')
          .update({ cover_image_id: null })
          .eq('cover_image_id', id)

        if (updateError) {
          console.error('Error removing cover image references:', updateError)
          return false
        }

        console.log('Successfully removed cover image references from projects')
      }

      // Now delete the image
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting image:', error)
        console.error('Error details:', error.message, error.details)
        console.error('Error code:', error.code)
        return false
      }

      // Clear cache after deleting image
      this.clearProjectCache()
      return true
    } catch (error) {
      console.error('Unexpected error in deleteImage:', error)
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
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

  // Get projects with cover images (for admin page) with pagination
  // Using separate queries (joined queries require proper FK configuration)
  static async getProjectsWithCoverImages(
    page: number = 0, 
    perPage: number = 50
  ): Promise<{ 
    projects: Array<Tables<'projects'> & { cover_image_url?: string }>, 
    total: number 
  }> {
    const cacheKey = `projects_with_covers_${page}_${perPage}`
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      console.log(`✅ Admin projects page ${page} loaded from cache (instant)`)
      return cachedData
    }

    try {
      console.time(`⏱️ getProjectsWithCoverImages (page ${page})`)
      const startTotal = performance.now()
      
      // Fetch projects with pagination
      const startQuery = performance.now()
      const { data: projectsData, error: projectsError, count } = await supabase
        .from('projects')
        .select('id, title, cover_image_id, created_at, is_active, featured, category, year, description, parent_id, updated_at, created_by', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(page * perPage, (page + 1) * perPage - 1)

      const queryTime = performance.now() - startQuery
      console.log(`⏱️ Projects query (page ${page}): ${queryTime.toFixed(0)}ms - fetched ${projectsData?.length || 0} projects`)

      if (projectsError || !projectsData) {
        console.error('❌ Error fetching projects:', projectsError)
        console.timeEnd(`⏱️ getProjectsWithCoverImages (page ${page})`)
        return { projects: [], total: 0 }
      }

      if (projectsData.length === 0) {
        console.timeEnd(`⏱️ getProjectsWithCoverImages (page ${page})`)
        return { projects: [], total: count || 0 }
      }

      // Fetch cover images for these projects
      const coverImageIds = projectsData.filter(p => p.cover_image_id).map(p => p.cover_image_id!)
      let coverImagesMap = new Map<string, string>()
      
      if (coverImageIds.length > 0) {
        const { data: coverImages } = await supabase
          .from('images')
          .select('id, url')
          .in('id', coverImageIds)
        
        if (coverImages) {
          coverImagesMap = new Map(coverImages.map(img => [img.id, img.url]))
        }
      }

      // Combine projects with cover images
      const result = projectsData.map(project => ({
        ...project,
        cover_image_url: project.cover_image_id ? coverImagesMap.get(project.cover_image_id) : undefined
      }))

      const totalTime = performance.now() - startTotal
      console.log(`✅ Admin projects completed in ${totalTime.toFixed(0)}ms (${result.length} projects, page ${page})`)
      console.timeEnd(`⏱️ getProjectsWithCoverImages (page ${page})`)

      if (totalTime < 500) {
        console.log('🎉 EXCELLENT PERFORMANCE: <500ms!')
      } else if (totalTime < 1000) {
        console.log('✅ GOOD PERFORMANCE: <1s')
      }

      const response = { projects: result, total: count || 0 }
      this.setCachedData(cacheKey, response)
      return response
    } catch (error) {
      console.error('❌ Error in getProjectsWithCoverImages:', error)
      console.timeEnd(`⏱️ getProjectsWithCoverImages (page ${page})`)
      return { projects: [], total: 0 }
    }
  }
}
