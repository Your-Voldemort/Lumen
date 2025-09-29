import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/sign-in' }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while Clerk is determining auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}