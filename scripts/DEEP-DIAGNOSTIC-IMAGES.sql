-- DEEP DIAGNOSTIC: Find the REAL problem with images table
-- RLS is disabled, so what's causing 109-second queries?

-- 1. Check table size and row count
SELECT 
    pg_size_pretty(pg_total_relation_size('public.images')) as total_size,
    pg_size_pretty(pg_relation_size('public.images')) as table_size,
    COUNT(*) as row_count
FROM public.images;

-- 2. Check average URL length (are they base64 encoded?)
SELECT 
    COUNT(*) as image_count,
    AVG(LENGTH(url)) as avg_url_length,
    MAX(LENGTH(url)) as max_url_length,
    MIN(LENGTH(url)) as min_url_length
FROM public.images;

-- 3. Test a simple query timing
EXPLAIN ANALYZE
SELECT id, name, project_id FROM public.images LIMIT 10;

-- 4. Test full query timing (with URL field)
EXPLAIN ANALYZE
SELECT * FROM public.images LIMIT 10;

-- 5. Check if there are any slow queries or locks
SELECT 
    pid,
    now() - query_start as duration,
    state,
    query
FROM pg_stat_activity
WHERE state != 'idle'
    AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;

