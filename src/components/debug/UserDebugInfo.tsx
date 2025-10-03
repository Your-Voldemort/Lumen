import { useUser } from '@clerk/clerk-react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UserDebugInfo() {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { user: appUser, needsProfileSetup, loading, error } = useSupabaseUser();

  return (
    <Card className="m-4 max-w-2xl">
      <CardHeader>
        <CardTitle>🔍 User Debug Info</CardTitle>
        <CardDescription>Current user state information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold">Clerk Status:</h4>
            <ul className="space-y-1">
              <li>Is Loaded: {isLoaded ? '✅' : '❌'}</li>
              <li>Is Signed In: {isSignedIn ? '✅' : '❌'}</li>
              <li>Clerk User ID: {clerkUser?.id || 'None'}</li>
              <li>Clerk Email: {clerkUser?.emailAddresses?.[0]?.emailAddress || 'None'}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold">Supabase Status:</h4>
            <ul className="space-y-1">
              <li>Loading: {loading ? '⏳' : '✅'}</li>
              <li>Has Error: {error ? '❌' : '✅'}</li>
              <li>App User: {appUser ? '✅' : '❌'}</li>
              <li>Needs Setup: {needsProfileSetup ? '⚠️' : '✅'}</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {appUser && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 text-sm">
              <strong>User Profile:</strong> {appUser.name} ({appUser.role}) - {appUser.department}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/'}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/setup'}
          >
            Go to Setup
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}