import { SupabaseContentService } from '../lib/supabase-content'

// This script migrates data from localStorage to Supabase
// Run this after setting up your environment variables

async function migrateData() {
  console.log('🚀 Starting migration from localStorage to Supabase...')

  try {
    // 1. Migrate Projects
    console.log('📁 Migrating projects...')
    const existingProjects = localStorage.getItem('SiteContent')
    if (existingProjects) {
      const content = JSON.parse(existingProjects)
      if (content.projects && Array.isArray(content.projects)) {
        for (const project of content.projects) {
          const migratedProject = await SupabaseContentService.createProject({
            title: project.title,
            category: project.category,
            description: project.description,
            year: project.year,
            cover_image_id: project.coverImageId || null,
            is_active: true
          })
          console.log(`✅ Migrated project: ${migratedProject?.title}`)
        }
      }
    }

    // 2. Migrate Images
    console.log('🖼️ Migrating images...')
    const existingImages = localStorage.getItem('ImageData')
    if (existingImages) {
      const images = JSON.parse(existingImages)
      if (Array.isArray(images)) {
        for (const image of images) {
          const migratedImage = await SupabaseContentService.createImage({
            name: image.name,
            url: image.url,
            category: image.category,
            project_id: image.projectId || null,
            file_size: image.size || 0,
            mime_type: 'image/jpeg', // Default, adjust if needed
            alt_text: image.name,
            is_cover_image: image.isCoverImage || false
          })
          console.log(`✅ Migrated image: ${migratedImage?.name}`)
        }
      }
    }

    // 3. Migrate Homepage Content
    console.log('🏠 Migrating homepage content...')
    const existingHomepage = localStorage.getItem('SiteContent')
    if (existingHomepage) {
      const content = JSON.parse(existingHomepage)
      if (content.homepage) {
        await SupabaseContentService.updateHomepageContent('hero', {
          title: content.homepage.heroTitle,
          subtitle: content.homepage.heroSubtitle,
          description: content.homepage.heroDescription
        })
        console.log('✅ Migrated hero section')

        if (content.homepage.services) {
          await SupabaseContentService.updateHomepageContent('services', {
            content: { services: content.homepage.services }
          })
          console.log('✅ Migrated services section')
        }
      }
    }

    // 4. Migrate About Content
    console.log('ℹ️ Migrating about content...')
    const existingAbout = localStorage.getItem('SiteContent')
    if (existingAbout) {
      const content = JSON.parse(existingAbout)
      if (content.about) {
        await SupabaseContentService.updateAboutContent('story', {
          title: 'Our Story',
          content: content.about.story,
          additional_data: {}
        })
        console.log('✅ Migrated story section')

        if (content.about.values) {
          await SupabaseContentService.updateAboutContent('values', {
            title: 'Our Values',
            content: '',
            additional_data: { values: content.about.values }
          })
          console.log('✅ Migrated values section')
        }

        if (content.about.team) {
          await SupabaseContentService.updateAboutContent('team', {
            title: 'Our Team',
            content: '',
            additional_data: { team: content.about.team }
          })
          console.log('✅ Migrated team section')
        }
      }
    }

    // 5. Create Default Categories
    console.log('🏷️ Creating default categories...')
    const defaultCategories = [
      { name: 'Commercial', description: 'Commercial steel projects', color: '#3B82F6' },
      { name: 'Industrial', description: 'Industrial steel projects', color: '#10B981' },
      { name: 'Residential', description: 'Residential steel projects', color: '#F59E0B' },
      { name: 'Infrastructure', description: 'Infrastructure steel projects', color: '#8B5CF6' },
      { name: 'General', description: 'General steel projects', color: '#6B7280' }
    ]

    for (const category of defaultCategories) {
      await SupabaseContentService.createCategory(category)
      console.log(`✅ Created category: ${category.name}`)
    }

    console.log('🎉 Migration completed successfully!')
    console.log('💡 You can now remove the localStorage data and update your components to use Supabase.')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run migration if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('This script should be run in Node.js environment')
} else {
  // Node.js environment
  migrateData()
}

export { migrateData }

