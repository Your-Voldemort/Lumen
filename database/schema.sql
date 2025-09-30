-- Smart Student Hub Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin', 'superadmin')),
  department TEXT NOT NULL,
  year TEXT, -- Only for students
  student_id TEXT, -- Only for students
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  student_id TEXT NOT NULL REFERENCES users(id),
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile and admins can see all
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Students can view their own activities
CREATE POLICY "Students can view own activities" ON activities
  FOR SELECT USING (
    student_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text 
      AND role IN ('faculty', 'admin', 'superadmin')
    )
  );

-- Students can insert their own activities
CREATE POLICY "Students can create activities" ON activities
  FOR INSERT WITH CHECK (student_id = auth.uid()::text);

-- Students can update their own pending activities
CREATE POLICY "Students can update own pending activities" ON activities
  FOR UPDATE USING (
    student_id = auth.uid()::text AND status = 'pending'
  );

-- Faculty and admins can update activity status
CREATE POLICY "Faculty can update activity status" ON activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text 
      AND role IN ('faculty', 'admin', 'superadmin')
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
-- This will be replaced by real user data from the application