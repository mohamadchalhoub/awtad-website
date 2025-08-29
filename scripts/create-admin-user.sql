-- Script to create the first admin user in Supabase
-- Run this in your Supabase SQL Editor after setting up the tables

-- Step 1: Create the admin user through Supabase Auth UI
-- Go to Authentication > Users > Add User
-- Email: husseinnouraldeen5@gmail.com
-- Password: Choose a strong password

-- Step 2: After user creation, first create their profile, then make them admin:
INSERT INTO public.user_profiles (user_id, email, role)
SELECT id, email, 'admin'
FROM auth.users 
WHERE email = 'husseinnouraldeen5@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Step 3: Verify the user is now admin
SELECT 
  up.email,
  up.role,
  up.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.email = 'husseinnouraldeen5@gmail.com';

-- Step 4: Test admin function
SELECT public.is_admin('husseinnouraldeen5@gmail.com') as is_admin;

-- Expected result: true
