// Security Cleanup Script for AWTAD
// Run this in your browser console to clean up all insecure data

console.log('🔒 Starting AWTAD Security Cleanup...')

// List of items to REMOVE (insecure)
const itemsToRemove = [
  'admin-password',
  'adminToken',
  'admin-email',
  'admin-credentials',
  'test-data',
  'demo-data'
]

// List of items to KEEP (secure)
const itemsToKeep = [
  'awtad_auth_user',
  'awtad_content_updated',
  'awtad_images',
  'awtad_site_content',
  'awtad_content_updated_timestamp',
  'cachedDbContentEn',
  'cachedDbContentEn_timestamp',
  'currentLanguage',
  'currentTheme'
]

// Remove insecure items
console.log('🗑️ Removing insecure localStorage items...')
itemsToRemove.forEach(item => {
  if (localStorage.getItem(item)) {
    localStorage.removeItem(item)
    console.log(`✅ Removed: ${item}`)
  }
})

// Clean up any other suspicious items
console.log('🔍 Scanning for other suspicious items...')
const allKeys = Object.keys(localStorage)
const suspiciousKeys = allKeys.filter(key => 
  key.includes('admin') || 
  key.includes('password') || 
  key.includes('token') ||
  key.includes('credential') ||
  key.includes('test') ||
  key.includes('demo')
)

suspiciousKeys.forEach(key => {
  if (!itemsToKeep.includes(key)) {
    localStorage.removeItem(key)
    console.log(`✅ Removed suspicious item: ${key}`)
  }
})

// Show current localStorage status
console.log('\n📋 Current localStorage status:')
const remainingKeys = Object.keys(localStorage)
remainingKeys.forEach(key => {
  const value = localStorage.getItem(key)
  const isSecure = itemsToKeep.includes(key)
  console.log(`${isSecure ? '✅' : '❓'} ${key}: ${value ? (typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value) : 'undefined'}`)
})

console.log('\n🎯 Cleanup completed!')
console.log('🔒 Your localStorage is now secure!')
console.log('💡 Only keep essential items for app functionality')
