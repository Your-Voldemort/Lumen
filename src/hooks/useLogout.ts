import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

export function useLogout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    
    try {
      // Show loading toast
      toast.loading('Logging out...', { id: 'logout' });

      // Clear any localStorage data
      try {
        localStorage.removeItem('currentUser');
        // Keep activities and users for next login
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Error clearing storage:', storageError);
        // Continue with logout even if storage clearing fails
      }

      // Navigate to home page
      navigate('/', { replace: true });
      
      // Show success message
      toast.success('Successfully logged out', { id: 'logout' });
      
      // Reload to reset app state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss('logout');
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}