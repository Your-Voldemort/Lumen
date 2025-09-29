import { SignIn } from '@clerk/clerk-react';
import { Card } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export function ClerkSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Smart Student Hub</h1>
          <p className="text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <Card className="p-6">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border-none",
                headerTitle: "text-2xl font-bold text-center",
                headerSubtitle: "text-muted-foreground text-center",
                socialButtonsBlockButton: "w-full",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                formFieldLabel: "text-sm font-medium",
                formFieldInput: "w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background",
                formButtonPrimary: "w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
            redirectUrl="/"
            signUpUrl="/sign-up"
          />
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{' '}
            <a href="/sign-up" className="text-primary hover:text-primary/80 font-medium">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}