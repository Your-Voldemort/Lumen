import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

export function useLogout() {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    
    try {
      // Show loading toast
      toast.loading('Logging out...', { id: 'logout' });

      // Clear any localStorage data
      try {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('activities');
        localStorage.removeItem('users');
        // Clear any other app-specific storage
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Error clearing storage:', storageError);
        // Continue with logout even if storage clearing fails
      }

      // Sign out with Clerk
      await signOut();
      
      // Navigate to sign-in page
      navigate('/sign-in', { replace: true });
      
      // Show success message
      toast.success('Successfully logged out', { id: 'logout' });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss('logout');
      toast.error('Failed to logout. Please try again.');
      
      // Try to force navigation even if signOut failed
      try {
        navigate('/sign-in', { replace: true });
      } catch (navError) {
        console.error('Navigation error during logout:', navError);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}