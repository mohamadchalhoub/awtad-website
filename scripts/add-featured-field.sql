-- Add featured field to projects table for featured projects functionality
-- Run this in your Supabase SQL Editor

-- Add featured boolean column with default false
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create index for better performance when querying featured projects
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;

-- Create composite index for featured + active + created_at (for homepage queries)
CREATE INDEX IF NOT EXISTS idx_projects_active_featured_created ON projects(is_active, featured, created_at DESC);

-- Optional: Set the 3 most recent projects as featured (you can modify this number)
UPDATE projects 
SET featured = true 
WHERE id IN (
  SELECT id FROM projects 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 3
);

-- Verify the changes
SELECT 
  COUNT(*) as total_projects,
  COUNT(CASE WHEN featured = true THEN 1 END) as featured_projects,
  COUNT(CASE WHEN featured = false THEN 1 END) as non_featured_projects
FROM projects 
WHERE is_active = true;
