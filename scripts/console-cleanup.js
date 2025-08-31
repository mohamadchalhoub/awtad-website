/**
 * 🔒 IMMEDIATE SECURITY CLEANUP
 * 
 * Copy and paste this entire script into your browser console (F12 → Console)
 * Press Enter to run it immediately.
 * 
 * This will remove all sensitive authentication data from localStorage.
 */

console.log('🔒 Starting immediate security cleanup...');

// Remove all sensitive authentication data
const sensitiveKeys = [
  'awtad_auth_user',
  'sb-vhezeyapqzoscfffgdzy-auth-token',
  'sb-vhezeyapqzoscfffgdzy-auth-token-expires-at',
  'sb-vhezeyapqzoscfffgdzy-auth-token-refresh-token'
];

let removedCount = 0;

// Remove known sensitive keys
sensitiveKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    removedCount++;
    console.log(`✅ Removed: ${key}`);
  }
});

// Remove any other Supabase auth tokens
const allKeys = Object.keys(localStorage);
allKeys.forEach(key => {
  if (key.includes('sb-') && key.includes('auth')) {
    localStorage.removeItem(key);
    removedCount++;
    console.log(`✅ Removed: ${key}`);
  }
});

// Clear sessionStorage for fresh start
sessionStorage.clear();
console.log('✅ Cleared sessionStorage');

console.log(`🔒 Security cleanup completed! Removed ${removedCount} sensitive items.`);
console.log('📝 You will need to log in again for security reasons.');

// Show current localStorage status
const remainingKeys = Object.keys(localStorage);
if (remainingKeys.length === 0) {
  console.log('🎉 localStorage is now completely clean!');
} else {
  console.log('📋 Remaining localStorage items:');
  remainingKeys.forEach(key => {
    console.log(`  - ${key}`);
  });
}

// Optional: Redirect to login if on admin page
if (window.location.pathname.includes('/admin')) {
  console.log('🔄 Redirecting to login page in 3 seconds...');
  setTimeout(() => {
    window.location.href = '/admin/login';
  }, 3000);
} 