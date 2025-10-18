-- Performance Optimization Script for AWTAD Database
-- This script adds indexes to speed up common queries
-- Run this in your Supabase SQL Editor

-- ============================================
-- INDEXES FOR FASTER QUERIES
-- ============================================

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_active_parent 
ON projects(is_active, parent_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_projects_featured 
ON projects(featured, is_active) 
WHERE is_active = true AND featured = true;

CREATE INDEX IF NOT EXISTS idx_projects_parent_id 
ON projects(parent_id) 
WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_cover_image 
ON projects(cover_image_id) 
WHERE cover_image_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_created_at 
ON projects(created_at DESC);

-- Images table indexes
CREATE INDEX IF NOT EXISTS idx_images_id 
ON images(id);

CREATE INDEX IF NOT EXISTS idx_images_project_id 
ON images(project_id) 
WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_images_category 
ON images(category);

CREATE INDEX IF NOT EXISTS idx_images_created_at 
ON images(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on tables if not already enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to active projects" ON projects;
DROP POLICY IF EXISTS "Allow public read access to images" ON images;
DROP POLICY IF EXISTS "Allow public read access to homepage_content" ON homepage_content;
DROP POLICY IF EXISTS "Allow public read access to about_content" ON about_content;
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;

-- Create public read policies (non-blocking)
CREATE POLICY "Allow public read access to active projects"
ON projects FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Allow public read access to images"
ON images FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access to homepage_content"
ON homepage_content FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access to about_content"
ON about_content FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access to categories"
ON categories FOR SELECT
TO public
USING (is_active = true);

-- ============================================
-- VACUUM AND ANALYZE FOR BETTER PERFORMANCE
-- ============================================
-- NOTE: VACUUM commands must be run separately (not in a transaction)
-- Run these commands ONE AT A TIME in Supabase SQL Editor:
-- 
-- VACUUM ANALYZE projects;
-- VACUUM ANALYZE images;
-- VACUUM ANALYZE homepage_content;
-- VACUUM ANALYZE about_content;
-- VACUUM ANALYZE categories;
--
-- Or use the separate script: scripts/vacuum-tables.sql

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('projects', 'images', 'homepage_content', 'about_content', 'categories')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Performance test query
EXPLAIN ANALYZE
SELECT p.*, 
       (SELECT COUNT(*) FROM projects sp WHERE sp.parent_id = p.id AND sp.is_active = true) as subproject_count
FROM projects p
WHERE p.is_active = true 
AND p.parent_id IS NULL
ORDER BY p.created_at DESC;

