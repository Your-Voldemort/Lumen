import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase, type DatabaseUser } from '../lib/supabase';
import { toast } from 'sonner';

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

        // Check if user exists in Supabase
        const { data: dbUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', clerkUser.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 is "not found", which is expected for new users
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
        year: profileData.year || null,
        student_id: profileData.studentId || null,
      };

      const { data, error } = await supabase
        .from('users')
        .insert([dbUser])
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