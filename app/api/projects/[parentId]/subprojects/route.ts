import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { parentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'newest'

    const parentId = parseInt(params.parentId)
    if (isNaN(parentId)) {
      return NextResponse.json({ error: 'Invalid parent ID' }, { status: 400 })
    }

    // Build query without joins to avoid issues
    let query = supabase
      .from('projects')
      .select('id, title, created_at, cover_image_id', { count: 'exact' })
      .eq('parent_id', parentId)
      .eq('is_active', true)

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
      console.error('Error fetching subprojects:', error)
      return NextResponse.json({ error: 'Failed to fetch subprojects' }, { status: 500 })
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

    return NextResponse.json({
      items,
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
