import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  year?: string;
  studentId?: string;
}

// Hook to map Clerk user to application user
export function useClerkUser() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [appUser, setAppUser] = useState<User | null>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      // Map Clerk user to your application's user structure
      const mappedUser: User = {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses?.[0]?.emailAddress || 'Unknown User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        role: determineUserRole(user),
        department: user.publicMetadata?.department as string || 'General',
        // Add student-specific fields if role is student
        ...(user.publicMetadata?.role === 'student' && {
          year: user.publicMetadata?.year as string,
          studentId: user.publicMetadata?.studentId as string,
        }),
      };
      
      setAppUser(mappedUser);
    } else {
      setAppUser(null);
    }
  }, [user, isSignedIn]);

  return {
    user: appUser,
    clerkUser: user,
    isSignedIn,
    isLoaded,
  };
}

// Helper function to determine user role based on Clerk user metadata
function determineUserRole(user: any): 'student' | 'faculty' | 'admin' {
  // Check if role is set in unsafe metadata (or public metadata if available)
  if (user.unsafeMetadata?.role) {
    return user.unsafeMetadata.role as 'student' | 'faculty' | 'admin';
  }
  
  if (user.publicMetadata?.role) {
    return user.publicMetadata.role as 'student' | 'faculty' | 'admin';
  }

  // Check email domain for role determination
  const email = user.emailAddresses?.[0]?.emailAddress || '';
  
  // Admin emails
  if (email.includes('admin@') || email.includes('@admin.')) {
    return 'admin';
  }
  
  // Faculty emails (could include patterns like faculty@, prof@, dr@, etc.)
  if (email.includes('faculty@') || email.includes('prof@') || email.includes('dr@')) {
    return 'faculty';
  }
  
  // Default to student for university email domains
  return 'student';
}

// Hook to update user metadata in Clerk
export function useUpdateUserMetadata() {
  const { user } = useUser();

  const updateUserRole = async (role: 'student' | 'faculty' | 'admin', additionalData: any = {}) => {
    if (!user) return;

    try {
      // Update using unsafeMetadata for now, or use a backend API to update publicMetadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role,
          ...additionalData,
        },
      });
    } catch (error) {
      console.error('Failed to update user metadata:', error);
      throw error;
    }
  };

  const updateStudentInfo = async (studentData: { department: string; year: string; studentId: string }) => {
    await updateUserRole('student', studentData);
  };

  const updateFacultyInfo = async (facultyData: { department: string }) => {
    await updateUserRole('faculty', facultyData);
  };

  const updateAdminInfo = async (adminData: { department: string }) => {
    await updateUserRole('admin', adminData);
  };

  return {
    updateUserRole,
    updateStudentInfo,
    updateFacultyInfo,
    updateAdminInfo,
  };
}