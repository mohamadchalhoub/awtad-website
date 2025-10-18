-- ============================================
-- CRITICAL: PROPER DATABASE INDEXES
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop old indexes if they exist (to recreate properly)
DROP INDEX IF EXISTS idx_projects_active_parent;
DROP INDEX IF EXISTS idx_projects_parent_id;
DROP INDEX IF EXISTS idx_projects_featured;
DROP INDEX IF EXISTS idx_images_id;

-- ============================================
-- PROJECTS TABLE INDEXES
-- ============================================

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_cover_image_id ON projects(cover_image_id);

-- Composite indexes (for queries that filter on multiple columns)
CREATE INDEX IF NOT EXISTS idx_projects_active_parent ON projects(is_active, parent_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_projects_active_created ON projects(is_active, created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_projects_parent_created ON projects(parent_id, created_at DESC);

-- ============================================
-- IMAGES TABLE INDEXES
-- ============================================

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_images_id ON images(id);
CREATE INDEX IF NOT EXISTS idx_images_project_id ON images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_images_project_created ON images(project_id, created_at DESC);

-- ============================================
-- CATEGORIES TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- ============================================
-- VERIFY INDEXES
-- ============================================

-- Run this to verify indexes were created:
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('projects', 'images', 'categories')
ORDER BY tablename, indexname;

-- ============================================
-- ANALYZE TABLES (Update statistics)
-- ============================================

ANALYZE projects;
ANALYZE images;
ANALYZE categories;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- After running this script:
-- 1. All queries with .eq(), .order(), .in() will be FAST
-- 2. Query times should drop from 30s to < 500ms
-- 3. No need to fetch all data and filter in JavaScript

