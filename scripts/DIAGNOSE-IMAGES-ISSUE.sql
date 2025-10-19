-- DEEP DIAGNOSTIC: Find out why images table is so slow
-- Run each section separately and share the results

-- 1. Check if RLS is the problem
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'images';

-- 2. Check ALL policies on images table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'images';

-- 3. Check if there are indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'images';

-- 4. Check table size and statistics
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public' AND tablename = 'images';

-- 5. Try a simple query to see timing
EXPLAIN ANALYZE
SELECT * FROM images LIMIT 10;

-- 6. Check for locks or blocking
SELECT 
    pid,
    usename,
    application_name,
    state,
    query,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE datname = current_database()
AND query ILIKE '%images%'
AND state != 'idle';

