-- URGENT FIX: Images table RLS is blocking queries
-- Run this in Supabase SQL Editor to fix 27-second image fetch

-- Step 1: Check if RLS is enabled (should show 'true')
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'images';

-- Step 2: Add PUBLIC READ policy for images
CREATE POLICY IF NOT EXISTS "Public images are viewable by everyone"
ON public.images
FOR SELECT
USING (true);

-- Step 3: Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'images';

-- Step 4: If you want to DISABLE RLS entirely (faster, but less secure):
-- ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;

-- Step 5: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_images_project_id ON public.images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category);

-- Step 6: Analyze table for query optimization
ANALYZE public.images;

-- Expected result: Images query should now be <200ms instead of 27 seconds!

