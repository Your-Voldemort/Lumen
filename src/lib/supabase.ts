import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DatabaseUser {
  id: string // Clerk user ID
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'faculty' | 'admin' | 'superadmin'
  department: string
  year?: string
  student_id?: string
  created_at: string
  updated_at: string
}

export interface DatabaseActivity {
  id: string
  title: string
  type: string
  description: string
  date: string
  student_id: string
  file_name?: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  created_at: string
  updated_at: string
}