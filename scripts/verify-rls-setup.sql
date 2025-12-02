-- ============================================
-- RLS VERIFICATION SCRIPT
-- ============================================
-- Run this BEFORE and AFTER applying the RLS fix
-- to see the difference
-- ============================================

-- ============================================
-- 1. Check RLS Status on All Tables
-- ============================================
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED' 
        ELSE '❌ RLS DISABLED - SECURITY RISK!' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects', 'categories', 'homepage_content', 'about_content', 'user_profiles')
ORDER BY tablename;

-- ============================================
-- 2. Check Policies on Each Table
-- ============================================
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has condition'
        ELSE 'No condition (allows all)'
    END as policy_condition
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects', 'categories', 'homepage_content', 'about_content')
ORDER BY tablename, cmd;

-- ============================================
-- 3. Count Policies per Table
-- ============================================
SELECT 
    tablename,
    COUNT(*) as policy_count,
    string_agg(DISTINCT cmd::text, ', ') as operations,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Has all policies (SELECT, INSERT, UPDATE, DELETE)'
        WHEN COUNT(*) > 0 THEN '⚠️ Missing some policies'
        ELSE '❌ No policies - queries will fail if RLS is enabled!'
    END as status
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects', 'categories', 'homepage_content', 'about_content')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 4. Check Admin Function Exists
-- ============================================
SELECT 
    routine_name as function_name,
    routine_type,
    CASE 
        WHEN routine_name = 'is_current_user_admin' THEN '✅ Admin check function exists'
        ELSE '❌ Admin check function missing'
    END as status
FROM information_schema.routines
WHERE routine_schema = 'public' 
    AND routine_name = 'is_current_user_admin';

-- ============================================
-- 5. Check Admin Users
-- ============================================
SELECT 
    up.email,
    up.role,
    up.created_at,
    CASE 
        WHEN up.role = 'admin' THEN '✅ This user is admin'
        ELSE '❌ This user is not admin'
    END as admin_status
FROM public.user_profiles up
ORDER BY up.role DESC, up.email;

-- ============================================
-- 6. Test Admin Function (if you're logged in)
-- ============================================
-- This will only work if you're authenticated
-- Returns true if current user is admin, false otherwise
SELECT 
    public.is_current_user_admin() as is_current_user_admin,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN '⚠️ Not authenticated - cannot check admin status'
        WHEN public.is_current_user_admin() THEN '✅ Current user is admin'
        ELSE '❌ Current user is NOT admin'
    END as status;

-- ============================================
-- 7. Check Table Permissions
-- ============================================
SELECT 
    table_name,
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
    AND table_name IN ('images', 'projects', 'categories', 'homepage_content', 'about_content')
    AND grantee IN ('anon', 'authenticated', 'public')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- ============================================
-- EXPECTED RESULTS AFTER FIX:
-- ============================================
-- 1. All tables should show "✅ RLS ENABLED"
-- 2. Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- 3. Admin function should exist
-- 4. At least one user should be admin
-- 5. anon role should have SELECT on all tables
-- 6. authenticated role should have SELECT, INSERT, UPDATE, DELETE
-- ============================================

