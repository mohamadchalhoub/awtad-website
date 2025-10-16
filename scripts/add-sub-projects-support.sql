-- Add sub-projects support to projects table
-- Run this in your Supabase SQL Editor

-- Add parent_id column to support nested projects (sub-projects)
-- A project with parent_id IS NULL = parent project
-- A project with parent_id = <id> = sub-project of that parent
ALTER TABLE projects ADD COLUMN IF NOT EXISTS parent_id INTEGER NULL;

-- Add foreign key constraint to ensure referential integrity (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_parent_project'
  ) THEN
    ALTER TABLE projects 
      ADD CONSTRAINT fk_parent_project 
      FOREIGN KEY (parent_id) 
      REFERENCES projects(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better performance when querying sub-projects
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);

-- Create composite index for parent projects (where parent_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_projects_parent_only ON projects(parent_id) WHERE parent_id IS NULL;

-- Create composite index for active parent projects with featured status
CREATE INDEX IF NOT EXISTS idx_projects_parent_active_featured ON projects(is_active, featured, parent_id) WHERE parent_id IS NULL;

-- Add comment to the column for documentation
COMMENT ON COLUMN projects.parent_id IS 'References parent project ID for sub-projects. NULL indicates a parent project.';

-- Update RLS policies if needed (assuming projects table already has RLS enabled)
-- The existing policies should work fine with the new column

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'parent_id';


