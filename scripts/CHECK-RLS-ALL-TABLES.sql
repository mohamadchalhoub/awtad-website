-- Check RLS status and policies for ALL tables
-- This will show you which tables might be blocking queries

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) 
     FROM pg_policies 
     WHERE schemaname = t.schemaname 
     AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command,
    roles,
    CASE 
        WHEN qual IS NOT NULL THEN pg_get_expr(qual, (schemaname||'.'||tablename)::regclass)
        ELSE 'No condition'
    END as using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- IMPORTANT: If a table has RLS enabled but NO policies for 'anon' role,
-- queries from your app will HANG or be very slow!

