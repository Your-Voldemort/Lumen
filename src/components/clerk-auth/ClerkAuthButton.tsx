import { UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';

export function ClerkAuthButton() {
  const { isSignedIn, user } = useUser();

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

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        Welcome, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
      </span>
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