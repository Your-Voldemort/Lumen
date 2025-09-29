import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useLogout() {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Clear any localStorage data
      try {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('activities');
        localStorage.removeItem('users');
      } catch (error) {
        console.warn('Error clearing localStorage:', error);
      }

      // Sign out with Clerk
      await signOut();
      
      // Navigate to sign-in page
      navigate('/sign-in');
      
      // Show success message
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return { logout };
}