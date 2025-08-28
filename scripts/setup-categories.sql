-- Setup script for categories table
-- Run this in your Supabase SQL Editor

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Insert default categories if they don't exist
INSERT INTO categories (name, description, color, icon) VALUES
('Commercial', 'Commercial steel projects including offices, retail, and mixed-use buildings', '#3B82F6', '🏢'),
('Industrial', 'Industrial steel projects including factories, warehouses, and manufacturing facilities', '#10B981', '🏭'),
('Residential', 'Residential steel projects including homes, apartments, and housing complexes', '#F59E0B', '🏠'),
('Infrastructure', 'Infrastructure steel projects including bridges, tunnels, and transportation facilities', '#8B5CF6', '🌉'),
('General', 'General steel projects and miscellaneous structures', '#6B7280', '🏗️')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous access (for testing)
CREATE POLICY "Allow anonymous access to categories" ON categories
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Grant necessary permissions
GRANT ALL ON categories TO authenticated;
GRANT SELECT ON categories TO anon;
