-- WORKING FIX: Add public read policy for images table
-- This version handles existing policies correctly

-- Drop existing policy if it exists (no error if it doesn't)
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON public.images;
DROP POLICY IF EXISTS "public can read images" ON public.images;
DROP POLICY IF EXISTS "anon can read images" ON public.images;

-- Create new public read policy
CREATE POLICY "Public images are viewable by everyone"
ON public.images
FOR SELECT
USING (true);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_images_project_id ON public.images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category);

-- Optimize query planner
ANALYZE public.images;

-- Verify the policy was created
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'images';

