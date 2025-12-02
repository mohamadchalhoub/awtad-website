-- ============================================
-- COMPLETE RLS SETUP WITH PROPER POLICIES
-- ============================================
-- This script enables RLS on all tables and creates proper security policies
-- 
-- Requirements:
-- - Everyone (including unauthenticated users) can READ all data
-- - Only admins can INSERT, UPDATE, or DELETE
--
-- IMPORTANT: Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Create helper function to check if user is admin
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- Create function to check if the currently authenticated user is an admin
-- This uses auth.uid() to get the current user's ID from the JWT token
-- SET search_path = public prevents search_path injection attacks
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- If no user is authenticated, return false
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the current user has admin role in user_profiles
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO anon;

-- ============================================
-- STEP 2: Drop all existing conflicting policies
-- ============================================

-- Drop all existing policies on images table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'images'
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.images';
    END LOOP;
END $$;

-- Drop all existing policies on projects table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'projects'
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.projects';
    END LOOP;
END $$;

-- Drop all existing policies on categories table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'categories'
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.categories';
    END LOOP;
END $$;

-- Drop all existing policies on homepage_content table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'homepage_content'
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.homepage_content';
    END LOOP;
END $$;

-- Drop all existing policies on about_content table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'about_content'
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.about_content';
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Enable RLS on all tables
-- ============================================

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create policies for IMAGES table
-- ============================================

-- Everyone can read images (including unauthenticated users)
CREATE POLICY "Allow public read access to images"
ON public.images
FOR SELECT
TO public
USING (true);

-- Only admins can insert images
CREATE POLICY "Allow admin insert access to images"
ON public.images
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_admin());

-- Only admins can update images
CREATE POLICY "Allow admin update access to images"
ON public.images
FOR UPDATE
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Only admins can delete images
CREATE POLICY "Allow admin delete access to images"
ON public.images
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- ============================================
-- STEP 5: Create policies for PROJECTS table
-- ============================================

-- Everyone can read projects (including unauthenticated users)
CREATE POLICY "Allow public read access to projects"
ON public.projects
FOR SELECT
TO public
USING (true);

-- Only admins can insert projects
CREATE POLICY "Allow admin insert access to projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_admin());

-- Only admins can update projects
CREATE POLICY "Allow admin update access to projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Only admins can delete projects
CREATE POLICY "Allow admin delete access to projects"
ON public.projects
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- ============================================
-- STEP 6: Create policies for CATEGORIES table
-- ============================================

-- Everyone can read categories (including unauthenticated users)
CREATE POLICY "Allow public read access to categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- Only admins can insert categories
CREATE POLICY "Allow admin insert access to categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_admin());

-- Only admins can update categories
CREATE POLICY "Allow admin update access to categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Only admins can delete categories
CREATE POLICY "Allow admin delete access to categories"
ON public.categories
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- ============================================
-- STEP 7: Create policies for HOMEPAGE_CONTENT table
-- ============================================

-- Everyone can read homepage_content (including unauthenticated users)
CREATE POLICY "Allow public read access to homepage_content"
ON public.homepage_content
FOR SELECT
TO public
USING (true);

-- Only admins can insert homepage_content
CREATE POLICY "Allow admin insert access to homepage_content"
ON public.homepage_content
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_admin());

-- Only admins can update homepage_content
CREATE POLICY "Allow admin update access to homepage_content"
ON public.homepage_content
FOR UPDATE
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Only admins can delete homepage_content
CREATE POLICY "Allow admin delete access to homepage_content"
ON public.homepage_content
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- ============================================
-- STEP 8: Create policies for ABOUT_CONTENT table
-- ============================================

-- Everyone can read about_content (including unauthenticated users)
CREATE POLICY "Allow public read access to about_content"
ON public.about_content
FOR SELECT
TO public
USING (true);

-- Only admins can insert about_content
CREATE POLICY "Allow admin insert access to about_content"
ON public.about_content
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_admin());

-- Only admins can update about_content
CREATE POLICY "Allow admin update access to about_content"
ON public.about_content
FOR UPDATE
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Only admins can delete about_content
CREATE POLICY "Allow admin delete access to about_content"
ON public.about_content
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- ============================================
-- STEP 9: Grant necessary permissions
-- ============================================

-- Grant SELECT to anonymous users (for public read access)
GRANT SELECT ON public.images TO anon;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.homepage_content TO anon;
GRANT SELECT ON public.about_content TO anon;

-- Grant SELECT to authenticated users
GRANT SELECT ON public.images TO authenticated;
GRANT SELECT ON public.projects TO authenticated;
GRANT SELECT ON public.categories TO authenticated;
GRANT SELECT ON public.homepage_content TO authenticated;
GRANT SELECT ON public.about_content TO authenticated;

-- Grant INSERT, UPDATE, DELETE to authenticated users
-- (RLS policies will restrict these to admins only)
GRANT INSERT, UPDATE, DELETE ON public.images TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.homepage_content TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.about_content TO authenticated;

-- ============================================
-- STEP 10: Ensure specific users are admins
-- ============================================

-- Promote specific emails to admin role in user_profiles (idempotent)
-- These statements are safe to run multiple times
UPDATE public.user_profiles
SET role = 'admin'
WHERE email IN (
  'husseinnouraldeen5@gmail.com',
  'mohamadchalhoub24@gmail.com'
);

-- ============================================
-- STEP 11: Verify the setup
-- ============================================

-- Check RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED' 
        ELSE '❌ RLS DISABLED' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects', 'categories', 'homepage_content', 'about_content')
ORDER BY tablename;

-- Check policies count
SELECT 
    tablename,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policy_names
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects', 'categories', 'homepage_content', 'about_content')
GROUP BY tablename
ORDER BY tablename;

-- Expected results:
-- - All tables should show "✅ RLS ENABLED"
-- - Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- ============================================
-- NOTES:
-- ============================================
-- 1. After running this script, your Supabase Advisor should show no RLS errors
-- 2. All users (including unauthenticated) can READ data
-- 3. Only users with role='admin' in user_profiles can INSERT/UPDATE/DELETE
-- 4. The is_current_user_admin() function uses auth.uid() from the JWT token
-- 5. If you need to make a user admin, update their role in user_profiles:
--    UPDATE public.user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- ============================================

