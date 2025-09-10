-- Database optimization script for AWTAD project
-- Run this in your Supabase SQL Editor

-- Add indexes for better query performance
-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;

-- Images table indexes
CREATE INDEX IF NOT EXISTS idx_images_project_id ON images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_is_cover ON images(is_cover_image) WHERE is_cover_image = true;
CREATE INDEX IF NOT EXISTS idx_images_price ON images(price);

-- Homepage content indexes
CREATE INDEX IF NOT EXISTS idx_homepage_content_section ON homepage_content(section_name);
CREATE INDEX IF NOT EXISTS idx_homepage_content_updated_at ON homepage_content(updated_at DESC);

-- About content indexes
CREATE INDEX IF NOT EXISTS idx_about_content_section ON about_content(section_name);
CREATE INDEX IF NOT EXISTS idx_about_content_updated_at ON about_content(updated_at DESC);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_active_featured ON projects(is_active, featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_images_project_category ON images(project_id, category);
CREATE INDEX IF NOT EXISTS idx_images_project_cover ON images(project_id, is_cover_image) WHERE is_cover_image = true;

-- Analyze tables to update statistics
ANALYZE projects;
ANALYZE images;
ANALYZE homepage_content;
ANALYZE about_content;
ANALYZE categories;

-- Add comments for documentation
COMMENT ON INDEX idx_projects_is_active IS 'Index for filtering active projects';
COMMENT ON INDEX idx_projects_created_at IS 'Index for ordering projects by creation date';
COMMENT ON INDEX idx_images_project_id IS 'Index for finding images by project';
COMMENT ON INDEX idx_images_category IS 'Index for filtering images by category';
COMMENT ON INDEX idx_images_price IS 'Index for filtering/sorting images by price';

-- Enable query performance monitoring (if available)
-- This helps identify slow queries in production
-- Note: This might not be available in all Supabase plans
-- SET log_statement = 'all';
-- SET log_min_duration_statement = 1000; -- Log queries taking more than 1 second
