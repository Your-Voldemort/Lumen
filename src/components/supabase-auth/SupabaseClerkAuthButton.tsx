import { UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

export function SupabaseClerkAuthButton() {
  const { isSignedIn } = useUser();
  const { user: appUser, loading } = useSupabaseUser();

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a href="/sign-in" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Sign In
          </a>
        </Button>
        <Button size="sm" asChild>
          <a href="/sign-up" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Sign Up
          </a>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-sm">
        <div className="font-medium">
          {appUser?.name || 'Unknown User'}
        </div>
        <div className="text-xs text-muted-foreground capitalize">
          {appUser?.role || 'No Role'}
        </div>
      </div>
      <UserButton 
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
            userButtonPopoverCard: "shadow-lg border",
            userButtonPopoverActions: "space-y-1",
          }
        }}
        afterSignOutUrl="/sign-in"
      />
    </div>
  );
}