-- FIX: Disable RLS on projects table (same issue as images)
-- This will make projects queries INSTANT

-- 1. DISABLE RLS entirely on projects table
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- 2. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON public.projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON public.projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_cover_image_id ON public.projects(cover_image_id);

-- 3. Update statistics
ANALYZE public.projects;

-- 4. Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'projects';
-- Should show rowsecurity = false

-- Expected result: All queries should now be <500ms!

