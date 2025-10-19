-- SIMPLEST POSSIBLE FIX: Just disable RLS, nothing else
-- Run these ONE AT A TIME

-- 1. Disable RLS on images
ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on projects  
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- 3. Check it worked
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('images', 'projects');
-- Should show: rowsecurity = false for both

