const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Analyzing bundle size...')

// Run build with analysis
try {
  execSync('cross-env ANALYZE=true next build', { stdio: 'inherit' })
  console.log('✅ Bundle analysis complete!')
  console.log('📊 Check the generated .next/analyze/ directory for detailed reports')
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message)
  process.exit(1)
}
