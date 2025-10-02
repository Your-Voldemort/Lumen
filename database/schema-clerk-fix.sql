-- Updated Smart Student Hub Database Schema for Clerk Integration
-- This version removes RLS policies that depend on Supabase Auth
-- since we're using Clerk for authentication

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Students can view own activities" ON activities;
DROP POLICY IF EXISTS "Students can create activities" ON activities;
DROP POLICY IF EXISTS "Students can update own pending activities" ON activities;
DROP POLICY IF EXISTS "Faculty can update activity status" ON activities;

-- Disable RLS for now since we're using Clerk auth instead of Supabase auth
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Note: With Clerk authentication, we handle authorization at the application level
-- rather than using Supabase RLS policies since Supabase auth.uid() won't work
-- with Clerk user IDs.

-- You can optionally re-enable RLS later and create custom policies that work with
-- your application's authorization logic if needed.

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_activities_student_id ON activities(student_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);