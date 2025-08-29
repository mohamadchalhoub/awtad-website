# AWTAD Supabase Authentication Setup Guide

## 🚀 Overview
This guide will help you set up secure authentication using Supabase Auth instead of the hardcoded credentials system.

## 📋 Prerequisites
- Supabase project set up with environment variables configured
- Access to Supabase dashboard
- Basic understanding of SQL

## 🔧 Step-by-Step Setup

### 1. Database Setup
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the `scripts/setup-auth-tables.sql` script
4. This will create:
   - `user_profiles` table for user roles
   - Row Level Security (RLS) policies
   - Automatic profile creation trigger
   - Admin check function

### 2. Create Admin User
1. Go to Authentication > Users in Supabase dashboard
2. Click "Add User"
3. Enter:
   - Email: `husseinnouraldeen5@gmail.com`
   - Password: Choose a strong password
4. After user creation, run this SQL:
   ```sql
   UPDATE public.user_profiles 
   SET role = 'admin' 
   WHERE email = 'husseinnouraldeen5@gmail.com';
   ```

### 3. Environment Variables
Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Test Authentication
1. Start your development server
2. Go to `/admin/login`
3. Try logging in with the admin credentials
4. You should be redirected to `/admin/dashboard`

## 🔒 Security Features

### What's Implemented:
- ✅ **Supabase Auth**: Professional authentication system
- ✅ **Role-based Access**: Admin vs regular user roles
- ✅ **Row Level Security**: Database-level security
- ✅ **JWT Tokens**: Secure session management
- ✅ **Password Hashing**: Automatic password security
- ✅ **Email Verification**: Built-in email verification
- ✅ **Password Reset**: Secure password recovery

### What's Removed:
- ❌ Hardcoded credentials in code
- ❌ Simple localStorage tokens
- ❌ Basic password comparison

## 🛠️ API Endpoints

### Authentication Methods:
- `SupabaseAuthService.signIn()` - User login
- `SupabaseAuthService.signUp()` - User registration
- `SupabaseAuthService.signOut()` - User logout
- `SupabaseAuthService.getCurrentUser()` - Get current user
- `SupabaseAuthService.isAdmin()` - Check admin status
- `SupabaseAuthService.resetPassword()` - Password reset
- `SupabaseAuthService.updatePassword()` - Update password

## 🔄 Migration from Old System

### Old Auth System:
```typescript
// lib/auth.ts - REMOVE THIS FILE
export const AUTH_CONFIG = {
  adminEmail: "husseinnouraldeen5@gmail.com",
  adminPassword: "awtad2024",
}
```

### New Auth System:
```typescript
// lib/supabase-auth.ts - USE THIS INSTEAD
import { SupabaseAuthService } from '@/lib/supabase-auth'
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check your `.env.local` file
   - Ensure variables are properly set

2. **"Profile fetch error"**
   - Run the SQL setup script
   - Check if `user_profiles` table exists

3. **"Authentication failed"**
   - Verify user exists in Supabase Auth
   - Check if user has admin role in `user_profiles`

4. **"Permission denied"**
   - Ensure RLS policies are properly set
   - Check user role and permissions

### Debug Steps:
1. Check browser console for errors
2. Verify Supabase connection in dashboard
3. Check authentication logs in Supabase
4. Verify database policies are active

## 📱 Usage Examples

### Login Component:
```typescript
const { login, isLoading, isAdmin } = useAuth()

const handleLogin = async () => {
  const success = await login(email, password)
  if (success && isAdmin) {
    router.push('/admin/dashboard')
  }
}
```

### Protected Route:
```typescript
const { user, isAdmin } = useAuth()

if (!user || !isAdmin) {
  return <div>Access denied</div>
}
```

## 🔐 Best Practices

1. **Never store passwords in code**
2. **Use environment variables for sensitive data**
3. **Implement proper error handling**
4. **Use role-based access control**
5. **Enable Row Level Security**
6. **Regular security audits**
7. **Keep dependencies updated**

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Review browser console errors
3. Verify database setup
4. Check authentication policies

## 🎯 Next Steps

After successful setup:
1. Test all authentication flows
2. Implement password reset functionality
3. Add user management features
4. Set up audit logging
5. Configure email templates
6. Test security policies
