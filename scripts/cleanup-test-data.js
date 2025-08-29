// Test Data Cleanup Script for AWTAD
// Run this in your browser console to clean up test data

console.log('🧹 Starting AWTAD Test Data Cleanup...')

// Clean up test images from localStorage
console.log('🖼️ Cleaning up test images...')
const imagesKey = 'awtad_images'
const images = localStorage.getItem(imagesKey)

if (images) {
  try {
    const imageData = JSON.parse(images)
    if (Array.isArray(imageData)) {
      // Remove test images (you can customize this filter)
      const cleanImages = imageData.filter(img => {
        // Remove images with test names or suspicious content
        const isTestImage = 
          img.name?.toLowerCase().includes('test') ||
          img.name?.toLowerCase().includes('demo') ||
          img.name?.toLowerCase().includes('passport') ||
          img.name?.toLowerCase().includes('sample') ||
          img.name?.toLowerCase().includes('example') ||
          img.url?.includes('data:image') // Remove base64 encoded images
          
        if (isTestImage) {
          console.log(`🗑️ Removing test image: ${img.name}`)
          return false
        }
        return true
      })
      
      // Update localStorage with clean images
      if (cleanImages.length !== imageData.length) {
        localStorage.setItem(imagesKey, JSON.stringify(cleanImages))
        console.log(`✅ Cleaned up ${imageData.length - cleanImages.length} test images`)
        console.log(`📊 Remaining images: ${cleanImages.length}`)
      } else {
        console.log('✅ No test images found to remove')
      }
    }
  } catch (error) {
    console.log('❌ Error parsing images data:', error)
  }
}

// Clean up test content
console.log('📝 Cleaning up test content...')
const contentKey = 'awtad_site_content'
const content = localStorage.getItem(contentKey)

if (content) {
  try {
    const contentData = JSON.parse(content)
    
    // Clean up test projects
    if (contentData.projects && Array.isArray(contentData.projects)) {
      const cleanProjects = contentData.projects.filter(project => {
        const isTestProject = 
          project.title?.toLowerCase().includes('test') ||
          project.description?.toLowerCase().includes('test') ||
          project.title?.toLowerCase().includes('demo') ||
          project.title?.toLowerCase().includes('sample')
          
        if (isTestProject) {
          console.log(`🗑️ Removing test project: ${project.title}`)
          return false
        }
        return true
      })
      
      if (cleanProjects.length !== contentData.projects.length) {
        contentData.projects = cleanProjects
        localStorage.setItem(contentKey, JSON.stringify(contentData))
        console.log(`✅ Cleaned up ${contentData.projects.length - cleanProjects.length} test projects`)
      }
    }
    
    // Clean up test services
    if (contentData.homepage?.services && Array.isArray(contentData.homepage.services)) {
      const cleanServices = contentData.homepage.services.filter(service => {
        const isTestService = 
          service.title?.toLowerCase().includes('test') ||
          service.description?.toLowerCase().includes('test')
          
        if (isTestService) {
          console.log(`🗑️ Removing test service: ${service.title}`)
          return false
        }
        return true
      })
      
      if (cleanServices.length !== contentData.homepage.services.length) {
        contentData.homepage.services = cleanServices
        localStorage.setItem(contentKey, JSON.stringify(contentData))
        console.log(`✅ Cleaned up ${contentData.homepage.services.length - cleanServices.length} test services`)
      }
    }
    
  } catch (error) {
    console.log('❌ Error parsing content data:', error)
  }
}

// Clean up other test data
console.log('🔍 Cleaning up other test data...')
const testKeys = [
  'test-data',
  'demo-data',
  'sample-data',
  'temp-data',
  'debug-data'
]

testKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key)
    console.log(`✅ Removed test data: ${key}`)
  }
})

// Show final status
console.log('\n📋 Final localStorage status:')
const remainingKeys = Object.keys(localStorage)
remainingKeys.forEach(key => {
  const value = localStorage.getItem(key)
  console.log(`✅ ${key}: ${value ? (typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value) : 'undefined'}`)
})

console.log('\n🎯 Test data cleanup completed!')
console.log('🧹 Your app is now clean of test data!')
console.log('💡 Only production data remains in localStorage')
