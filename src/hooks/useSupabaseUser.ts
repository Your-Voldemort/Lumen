import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase, type DatabaseUser } from '../lib/supabase';
import { toast } from 'sonner';

// Debug function to check Supabase connection
const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful, user count:', data);
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'superadmin';
  department: string;
  year?: string;
  studentId?: string;
}

export function useSupabaseUser() {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check environment variables
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your_supabase_project_url_here' ||
        supabaseKey === 'your_supabase_anon_key_here') {
      setError('Supabase is not configured. Please set up your environment variables.');
      setLoading(false);
      toast.error('Database configuration missing. Please contact administrator.');
    }
  }, []);

  // Load user from Supabase
  useEffect(() => {
    async function loadUser() {
      if (!isSignedIn || !clerkUser) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Loading user for Clerk ID:', clerkUser.id);
        
        // Test Supabase connection first
        await testSupabaseConnection();

        // Check if user exists in Supabase
        const { data: dbUser, error: fetchError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, role, department, year, student_id, created_at, updated_at')
          .eq('id', clerkUser.id)
          .maybeSingle();

        console.log('Supabase query result:', { dbUser, fetchError });

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          throw fetchError;
        }

        if (dbUser) {
          // User exists in database
          const mappedUser: AppUser = {
            id: dbUser.id,
            name: `${dbUser.first_name} ${dbUser.last_name}`.trim(),
            email: dbUser.email,
            role: dbUser.role,
            department: dbUser.department,
            year: dbUser.year || undefined,
            studentId: dbUser.student_id || undefined,
          };
          setAppUser(mappedUser);
        } else {
          // New user - needs profile setup
          setAppUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user');
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      loadUser();
    }
  }, [clerkUser, isSignedIn, isLoaded]);

  // Create user profile in Supabase
  const createUserProfile = async (profileData: {
    firstName: string;
    lastName: string;
    role: 'student' | 'faculty' | 'admin' | 'superadmin';
    department: string;
    year?: string;
    studentId?: string;
  }) => {
    if (!clerkUser) throw new Error('No authenticated user');

    try {
      const dbUser: Omit<DatabaseUser, 'created_at' | 'updated_at'> = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        role: profileData.role,
        department: profileData.department,
        year: profileData.year || undefined,
        student_id: profileData.studentId || undefined,
      };

      console.log('Creating user profile:', dbUser);

      const { data, error } = await supabase
        .from('users')
        .insert([dbUser])
        .select('id, email, first_name, last_name, role, department, year, student_id, created_at, updated_at')
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      // Update local state
      const mappedUser: AppUser = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`.trim(),
        email: data.email,
        role: data.role,
        department: data.department,
        year: data.year || undefined,
        studentId: data.student_id || undefined,
      };
      
      setAppUser(mappedUser);
      toast.success('Profile created successfully!');
      
      return mappedUser;
    } catch (err) {
      console.error('Error creating user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<{
    firstName: string;
    lastName: string;
    department: string;
    year: string;
    studentId: string;
  }>) => {
    if (!clerkUser) throw new Error('No authenticated user');

    try {
      const updateData: any = {};
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.department !== undefined) updateData.department = updates.department;
      if (updates.year !== undefined) updateData.year = updates.year;
      if (updates.studentId !== undefined) updateData.student_id = updates.studentId;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', clerkUser.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const mappedUser: AppUser = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`.trim(),
        email: data.email,
        role: data.role,
        department: data.department,
        year: data.year || undefined,
        studentId: data.student_id || undefined,
      };
      
      setAppUser(mappedUser);
      toast.success('Profile updated successfully!');
      
      return mappedUser;
    } catch (err) {
      console.error('Error updating user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user: appUser,
    clerkUser,
    isSignedIn,
    isLoaded,
    loading,
    error,
    createUserProfile,
    updateUserProfile,
    needsProfileSetup: isSignedIn && !loading && !appUser,
  };
}