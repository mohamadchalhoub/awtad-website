-- ============================================
-- FIX FUNCTION SEARCH PATH WARNINGS
-- ============================================
-- This script fixes the "function_search_path_mutable" warnings
-- by setting explicit search_path on security functions
--
-- Why this matters:
-- Without setting search_path, functions are vulnerable to
-- search_path injection attacks where malicious users could
-- manipulate the search path to execute unintended code.
-- ============================================

-- ============================================
-- Fix is_current_user_admin() function
-- ============================================

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- If no user is authenticated, return false
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the current user has admin role in user_profiles
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  );
END;
$$;

-- ============================================
-- Fix is_admin() function (if it exists)
-- ============================================
-- This function might exist from older setup scripts
-- If you get an error that it doesn't exist, that's fine - just skip it

-- First, drop it if it exists (to avoid signature conflicts)
DROP FUNCTION IF EXISTS public.is_admin(TEXT);

-- Now create it with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE email = user_email 
    AND role = 'admin'
  );
END;
$$;

-- Grant permissions (only if function was created successfully)
GRANT EXECUTE ON FUNCTION public.is_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(TEXT) TO anon;

-- ============================================
-- Verify the fix
-- ============================================

-- Check function search_path settings
SELECT 
    p.proname as function_name,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✅ search_path is set'
        ELSE '❌ search_path is NOT set - SECURITY RISK!'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('is_current_user_admin', 'is_admin')
ORDER BY p.proname;

-- ============================================
-- Expected Result:
-- Both functions should show "✅ search_path is set"
-- ============================================
