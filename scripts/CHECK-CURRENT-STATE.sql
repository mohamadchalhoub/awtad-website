-- Quick check: What's the current state of RLS?
-- Run this to see if the previous script actually worked

-- 1. Check RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '❌ RLS IS ENABLED - THIS IS THE PROBLEM!'
        ELSE '✅ RLS IS DISABLED - GOOD!'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects', 'categories')
ORDER BY tablename;

-- 2. Check if there are ANY policies still active
SELECT 
    tablename,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policy_names
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('images', 'projects')
GROUP BY tablename;

-- 3. Check permissions
SELECT 
    tablename,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
    AND table_name IN ('images', 'projects')
    AND grantee IN ('anon', 'authenticated')
ORDER BY tablename, grantee;

