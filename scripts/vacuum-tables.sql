-- VACUUM Tables for Better Performance
-- Run these commands ONE AT A TIME in Supabase SQL Editor
-- (VACUUM cannot run in a transaction block)

-- Projects table
VACUUM ANALYZE projects;

-- Images table
VACUUM ANALYZE images;

-- Homepage content table
VACUUM ANALYZE homepage_content;

-- About content table
VACUUM ANALYZE about_content;

-- Categories table
VACUUM ANALYZE categories;

