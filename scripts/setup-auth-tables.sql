-- Setup script for AWTAD authentication tables
-- Run this in your Supabase SQL editor

-- Note: auth.users table is managed by Supabase and already has RLS enabled
-- We only need to set up our custom user_profiles table and policies

-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert profiles
CREATE POLICY "Authenticated users can insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Note: Supabase automatically handles user creation
-- We'll create profiles manually or through our application logic
-- This is more secure and gives us better control

-- Create admin user (you'll need to change the password after first login)
-- First, create the user through Supabase Auth UI or API
-- Then run this to make them admin:
-- UPDATE public.user_profiles SET role = 'admin' WHERE email = 'husseinnouraldeen5@gmail.com';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.user_profiles TO anon;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE email = user_email AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(TEXT) TO anon;
