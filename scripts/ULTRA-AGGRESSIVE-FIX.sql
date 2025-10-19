-- ULTRA-AGGRESSIVE FIX: Nuclear option to fix RLS issues
-- This will DROP ALL policies and FORCE disable RLS

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Drop ALL policies on images (there might be multiple)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'images') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.images';
    END LOOP;
END $$;

-- Drop ALL policies on projects
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.projects';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: FORCE DISABLE RLS
-- ============================================

ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: GRANT PUBLIC ACCESS (just in case)
-- ============================================

GRANT SELECT ON public.images TO anon;
GRANT SELECT ON public.images TO authenticated;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.projects TO authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.categories TO authenticated;

-- ============================================
-- STEP 4: ADD ALL INDEXES
-- ============================================

-- Images indexes
DROP INDEX IF EXISTS idx_images_project_id;
DROP INDEX IF EXISTS idx_images_created_at;
DROP INDEX IF EXISTS idx_images_category;

CREATE INDEX idx_images_project_id ON public.images(project_id);
CREATE INDEX idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX idx_images_category ON public.images(category);
CREATE INDEX idx_images_id ON public.images(id);

-- Projects indexes
DROP INDEX IF EXISTS idx_projects_is_active;
DROP INDEX IF EXISTS idx_projects_parent_id;
DROP INDEX IF EXISTS idx_projects_created_at;
DROP INDEX IF EXISTS idx_projects_cover_image_id;
DROP INDEX IF EXISTS idx_projects_active_parent;

CREATE INDEX idx_projects_is_active ON public.projects(is_active);
CREATE INDEX idx_projects_parent_id ON public.projects(parent_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_cover_image_id ON public.projects(cover_image_id);
CREATE INDEX idx_projects_active_parent ON public.projects(is_active, parent_id);
CREATE INDEX idx_projects_id ON public.projects(id);

-- ============================================
-- STEP 5: VACUUM AND ANALYZE
-- ============================================

VACUUM ANALYZE public.images;
VACUUM ANALYZE public.projects;

-- ============================================
-- STEP 6: VERIFY EVERYTHING
-- ============================================

-- Check RLS status
SELECT 
    'RLS Status' as check_type,
    tablename,
    CASE WHEN rowsecurity THEN '❌ STILL ENABLED!' ELSE '✅ DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects')
ORDER BY tablename;

-- Check policies (should be NONE)
SELECT 
    'Policies' as check_type,
    tablename,
    COUNT(*) as policy_count,
    CASE WHEN COUNT(*) > 0 THEN '❌ POLICIES EXIST!' ELSE '✅ NO POLICIES' END as status
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects')
GROUP BY tablename;

-- Check indexes
SELECT 
    'Indexes' as check_type,
    tablename,
    COUNT(*) as index_count,
    CASE WHEN COUNT(*) >= 4 THEN '✅ INDEXES EXIST' ELSE '❌ MISSING INDEXES' END as status
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects')
GROUP BY tablename;

