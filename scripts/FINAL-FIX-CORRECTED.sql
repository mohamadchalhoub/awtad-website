-- FINAL FIX: Corrected version that handles existing indexes
-- Run this INSTEAD of the previous script

-- ============================================
-- STEP 1: DROP ALL POLICIES
-- ============================================

DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'images') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.images';
    END LOOP;
END $$;

DO $$ 
DECLARE r RECORD;
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
-- STEP 3: GRANT PUBLIC ACCESS
-- ============================================

GRANT SELECT ON public.images TO anon, authenticated;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;

-- ============================================
-- STEP 4: ADD INDEXES (IF NOT EXISTS)
-- ============================================

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_images_project_id ON public.images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category);
CREATE INDEX IF NOT EXISTS idx_images_id ON public.images(id);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON public.projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON public.projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_cover_image_id ON public.projects(cover_image_id);
CREATE INDEX IF NOT EXISTS idx_projects_active_parent ON public.projects(is_active, parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_id ON public.projects(id);

-- ============================================
-- STEP 5: VACUUM AND ANALYZE
-- ============================================

VACUUM ANALYZE public.images;
VACUUM ANALYZE public.projects;

-- ============================================
-- STEP 6: VERIFY (should show false for rowsecurity)
-- ============================================

SELECT 
    tablename,
    rowsecurity,
    CASE WHEN rowsecurity THEN '❌ STILL ENABLED' ELSE '✅ DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects')
ORDER BY tablename;

