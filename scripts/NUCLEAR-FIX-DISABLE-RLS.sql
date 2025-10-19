-- NUCLEAR OPTION: Disable RLS entirely on images table
-- This will make queries INSTANT but removes row-level security
-- Only use if you want ALL images to be publicly readable

-- WARNING: This removes ALL security policies!
-- Run this ONLY if you're okay with all images being public

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON public.images;
DROP POLICY IF EXISTS "public can read images" ON public.images;
DROP POLICY IF EXISTS "anon can read images" ON public.images;

-- 2. DISABLE RLS entirely (makes table completely public)
ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_project_id ON public.images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category);

-- 4. Update statistics
ANALYZE public.images;

-- 5. Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'images';
-- Should show rowsecurity = false

-- Expected result: Images queries should now be <100ms instead of 59 seconds!

