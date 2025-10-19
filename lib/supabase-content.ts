import { supabase } from './supabase'
import type { Tables, InsertDto, UpdateDto } from './supabase'

export class SupabaseContentService {
  // Cache for storing fetched data
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_DURATION = 10 * 1000 // 10 seconds - very short for debugging
  private static MAX_CACHE_SIZE = 100 // Limit cache size to prevent memory issues

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

  // Set data in cache with size limit
  private static setCachedData(key: string, data: any) {
    // Clear oldest entries if cache is too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
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

  // Projects
  static async getAllProjects(): Promise<Tables<'projects'>[]> {
    // Check cache first
    const cacheKey = 'all_projects'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      console.log('✅ All projects loaded from cache (instant)')
      return cachedData
    }

    console.log('🚀🚀🚀 START: getAllProjects called')
    console.time('⏱️ getAllProjects - Total Time')
    const startTotal = performance.now()
    
    console.log('🔄 Fetching active projects...')
    const startQuery = performance.now()

    // Use simple query without joins (joins require proper FK configuration)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(200)

    const queryTime = performance.now() - startQuery
    console.log(`⏱️ getAllProjects query: ${queryTime.toFixed(0)}ms`)

    if (queryTime > 1000) {
      console.error(`❌ SLOW QUERY: getAllProjects took ${queryTime.toFixed(0)}ms`)
      console.error('🔧 FIX: Run scripts/add-performance-indexes.sql in Supabase SQL Editor')
    }

    if (error) {
      console.error(`❌ Error fetching projects:`, error)
      console.timeEnd('⏱️ getAllProjects - Total Time')
      return []
    }

    const result = data || []
    const totalTime = performance.now() - startTotal
    console.log(`✅ Projects fetched: ${result.length} projects in ${totalTime.toFixed(0)}ms`)
    console.timeEnd('⏱️ getAllProjects - Total Time')
    
    if (totalTime < 500) {
      console.log('🎉 EXCELLENT PERFORMANCE: <500ms!')
    } else if (totalTime < 1000) {
      console.log('✅ GOOD PERFORMANCE: <1s')
    }
    
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

  // FALLBACK: Use separate queries if joined query fails (for backward compatibility)
  private static async getParentProjectsWithSubprojectsFallback(): Promise<Array<Tables<'projects'> & { 
    cover_image_url?: string;
    subprojectsCount: number; 
    subprojectsPreview: Array<{ id: number; title: string; slug: string; thumbnail_url?: string; created_at: string }> 
  }>> {
    try {
      console.log('🔄 Using optimized fallback with parallel queries...')
      console.time('⏱️ Fallback - Total Time')
      const startTotal = performance.now()
      
      // Step 1: Fetch parent projects (FAST with indexes)
      console.time('⏱️ Fallback - Parent Projects')
      const startParents = performance.now()
      const { data: parentProjects, error: parentError } = await supabase
        .from('projects')
        .select('id, title, category, description, year, cover_image_id, created_at, featured, parent_id, is_active, updated_at, created_by')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(30)

      console.timeEnd('⏱️ Fallback - Parent Projects')
      console.log(`   📊 Fetched ${parentProjects?.length || 0} parent projects in ${(performance.now() - startParents).toFixed(0)}ms`)

      if (parentError || !parentProjects || parentProjects.length === 0) {
        console.error('❌ Fallback: No parent projects found:', parentError)
        console.timeEnd('⏱️ Fallback - Total Time')
        return []
      }

      // Step 2 & 3: Fetch subprojects and images in PARALLEL
      console.log('📡 Fetching subprojects and cover images in parallel...')
      const parentIds = parentProjects.map(p => p.id)
      const parentCoverImageIds = parentProjects.filter(p => p.cover_image_id).map(p => p.cover_image_id!)

      const startParallel = performance.now()
      const [subprojectsResult, coverImagesResult] = await Promise.allSettled([
        // Query 1: Fetch subprojects
        supabase
          .from('projects')
          .select('id, title, parent_id, cover_image_id, created_at')
          .eq('is_active', true)
          .in('parent_id', parentIds)
          .order('created_at', { ascending: false })
          .limit(200),
        
        // Query 2: Fetch parent cover images
        parentCoverImageIds.length > 0
          ? supabase.from('images').select('id, url').in('id', parentCoverImageIds)
          : Promise.resolve({ data: [], error: null })
      ])

      const parallelTime = performance.now() - startParallel
      console.log(`   ⚡ Parallel queries completed in ${parallelTime.toFixed(0)}ms`)

      // Extract data from parallel queries
      const allSubprojects = subprojectsResult.status === 'fulfilled' ? (subprojectsResult.value.data || []) : []
      let coverImagesMap = new Map<string, string>()
      
      if (coverImagesResult.status === 'fulfilled' && coverImagesResult.value.data) {
        coverImagesMap = new Map(coverImagesResult.value.data.map(img => [img.id, img.url]))
      }

      console.log(`   📊 Found ${allSubprojects.length} subprojects`)

      // Step 4: Fetch subproject cover images if needed
      const subprojectCoverImageIds = allSubprojects.filter(sp => sp.cover_image_id).map(sp => sp.cover_image_id!)
      const newImageIds = subprojectCoverImageIds.filter(id => !coverImagesMap.has(id))
      
      if (newImageIds.length > 0) {
        console.log(`   🖼️  Fetching ${newImageIds.length} additional subproject cover images...`)
        const { data: subImages } = await supabase
          .from('images')
          .select('id, url')
          .in('id', newImageIds)
        
        if (subImages) {
          subImages.forEach(img => coverImagesMap.set(img.id, img.url))
        }
      }

      // Step 5: Group and combine data (FAST - in-memory)
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
      console.timeEnd('⏱️ Fallback - Total Time')
      console.log(`✅ Fallback completed: ${result.length} parents with ${allSubprojects.length} subprojects in ${totalTime.toFixed(0)}ms`)
      
      if (totalTime < 1000) {
        console.log('🎉 EXCELLENT PERFORMANCE: <1s!')
      } else if (totalTime < 2000) {
        console.log('✅ GOOD PERFORMANCE: <2s')
      } else {
        console.warn('⚠️ Consider running database indexes: scripts/add-performance-indexes.sql')
      }

      return result
    } catch (error) {
      console.error('❌ Fallback method also failed:', error)
      console.timeEnd('⏱️ Fallback - Total Time')
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

  // Images
  static async getAllImages(): Promise<Tables<'images'>[]> {
    // Check cache first
    const cacheKey = 'all_images'
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      console.log('✅ Images loaded from cache (instant)')
      return cachedData
    }

    console.log('🚀🚀🚀 START: getAllImages called')
    console.time('⏱️ getAllImages - Total Time')
    const startTotal = performance.now()
    
    console.log('🔄 Fetching all images from Supabase...')
    const startQuery = performance.now()

    // OPTIMIZED: Use Supabase sorting with indexes
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    const queryTime = performance.now() - startQuery
    console.log(`⏱️ getAllImages DB query: ${queryTime.toFixed(0)}ms`)
    
    if (queryTime > 1000) {
      console.error(`❌ SLOW QUERY: getAllImages took ${queryTime.toFixed(0)}ms (>1s)`)
      console.error('💡 TIP: Run scripts/add-performance-indexes.sql in Supabase')
    }

    if (error) {
      console.error('❌ Error fetching images:', error)
      console.timeEnd('⏱️ getAllImages - Total Time')
      return []
    }

    const result = data || []
    const totalTime = performance.now() - startTotal
    console.log(`✅ Images fetched: ${result.length} images in ${totalTime.toFixed(0)}ms`)
    console.timeEnd('⏱️ getAllImages - Total Time')
    
    if (totalTime > 2000) {
      console.error(`⚠️ PERFORMANCE WARNING: getAllImages total time ${totalTime.toFixed(0)}ms (>2s)`)
    }
    
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
