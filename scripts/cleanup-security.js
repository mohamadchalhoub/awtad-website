/**
 * Security Cleanup Script
 * 
 * This script removes sensitive authentication data from localStorage
 * and implements the new secure session storage system.
 * 
 * Run this in the browser console or as a one-time cleanup.
 */

(function() {
  'use strict';
  
  console.log('🔒 Starting security cleanup...');
  
  // List of sensitive keys to remove
  const sensitiveKeys = [
    'awtad_auth_user',
    'sb-vhezeyapqzoscfffgdzy-auth-token',
    'sb-vhezeyapqzoscfffgdzy-auth-token-expires-at',
    'sb-vhezeyapqzoscfffgdzy-auth-token-refresh-token'
  ];
  
  // Remove sensitive data from localStorage
  let removedCount = 0;
  sensitiveKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Removed: ${key}`);
    }
  });
  
  // Remove any other Supabase-related auth tokens
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.includes('sb-') && key.includes('auth')) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Removed: ${key}`);
    }
  });
  
  // Clear sessionStorage as well (fresh start)
  sessionStorage.clear();
  console.log('✅ Cleared sessionStorage');
  
  console.log(`🔒 Security cleanup completed! Removed ${removedCount} sensitive items.`);
  console.log('📝 Note: You will need to log in again for security reasons.');
  
  // Optional: Redirect to login page
  if (window.location.pathname.includes('/admin')) {
    console.log('🔄 Redirecting to login page...');
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
  }
})();
