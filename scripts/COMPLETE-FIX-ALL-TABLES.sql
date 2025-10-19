-- COMPLETE FIX: Disable RLS on ALL public tables and add all indexes
-- This is the nuclear option - run this to fix everything at once

-- ============================================
-- STEP 1: DISABLE RLS ON ALL RELEVANT TABLES
-- ============================================

ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: ADD ALL PERFORMANCE INDEXES
-- ============================================

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_images_project_id ON public.images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category);
CREATE INDEX IF NOT EXISTS idx_images_id ON public.images(id);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_id ON public.projects(id);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON public.projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON public.projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_cover_image_id ON public.projects(cover_image_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_active_parent ON public.projects(is_active, parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_active_featured ON public.projects(is_active, featured);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- ============================================
-- STEP 3: UPDATE ALL STATISTICS
-- ============================================

ANALYZE public.images;
ANALYZE public.projects;
ANALYZE public.categories;
ANALYZE public.homepage_content;
ANALYZE public.about_content;

-- ============================================
-- STEP 4: VERIFY ALL TABLES HAVE RLS DISABLED
-- ============================================

SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '❌ RLS ENABLED' ELSE '✅ RLS DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects', 'categories', 'homepage_content', 'about_content')
ORDER BY tablename;

-- Expected: All tables should show "✅ RLS DISABLED"

