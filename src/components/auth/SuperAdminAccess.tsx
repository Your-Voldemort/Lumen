import { ReactNode } from 'react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Shield } from 'lucide-react';

interface SuperAdminAccessProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuperAdminAccess({ children, fallback }: SuperAdminAccessProps) {
  const { user, isLoaded } = useClerkUser();

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Check if user has super admin access
  if (!user || user.role !== 'superadmin') {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Crown className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Super Admin Access Required</CardTitle>
            <CardDescription>
              This area is restricted to Super Administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-red-50 p-4 rounded-lg">
              <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-700">
                You need Super Administrator privileges to access this section.
                Contact your system administrator if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for checking super admin status
export function useSuperAdminAccess() {
  const { user, isLoaded } = useClerkUser();
  
  return {
    isSuperAdmin: user?.role === 'superadmin',
    isLoaded,
    user
  };
}