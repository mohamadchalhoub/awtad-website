-- Setup script for homepage_content and about_content tables
-- Run this in your Supabase SQL Editor

-- Create homepage_content table
CREATE TABLE IF NOT EXISTS homepage_content (
  id SERIAL PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Create about_content table
CREATE TABLE IF NOT EXISTS about_content (
  id SERIAL PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Insert initial homepage content
INSERT INTO homepage_content (section_name, title, subtitle, description, content) VALUES
('hero', 'Advanced Steel Design', 'Engineering Excellence', 'Innovative steel solutions for modern challenges', NULL),
('services', NULL, NULL, NULL, '{"services": [{"title": "Structural Design", "description": "Advanced structural analysis and design", "icon": "🏗️"}, {"title": "Fabrication", "description": "Precision steel fabrication services", "icon": "⚙️"}, {"title": "Installation", "description": "Professional installation and assembly", "icon": "🔧"}]}')
ON CONFLICT (section_name) DO NOTHING;

-- Insert initial about content
INSERT INTO about_content (section_name, title, content, additional_data) VALUES
('story', NULL, 'Our journey in steel engineering excellence began with a vision to transform the industry through innovative design, cutting-edge technology, and unwavering commitment to quality. Today, we stand as a leading force in steel engineering, delivering solutions that exceed expectations and drive progress in construction and infrastructure development.', NULL),
('values', NULL, NULL, '{"values": [{"title": "Innovation", "description": "Pushing boundaries in steel design and engineering", "icon": "💡"}, {"title": "Quality", "description": "Uncompromising quality standards", "icon": "⭐"}, {"title": "Safety", "description": "Safety-first approach in all our operations", "icon": "🛡️"}]}'),
('team', NULL, NULL, '{"team": [{"name": "Engineering Team", "role": "Steel Design Specialists", "bio": "Expert engineers with decades of experience in structural steel design and analysis", "avatar": "👥"}, {"name": "Project Management", "role": "Project Coordinators", "bio": "Dedicated professionals ensuring timely delivery and quality control", "avatar": "📋"}]}')
ON CONFLICT (section_name) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous access (for testing)
CREATE POLICY "Allow anonymous access to homepage_content" ON homepage_content
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to about_content" ON about_content
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_homepage_content_section ON homepage_content(section_name);
CREATE INDEX IF NOT EXISTS idx_about_content_section ON about_content(section_name);





