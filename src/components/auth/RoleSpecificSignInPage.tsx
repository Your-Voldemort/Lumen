import { SignIn } from '@clerk/clerk-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface RoleConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
}

const roleConfigs: Record<string, RoleConfig> = {
  student: {
    title: 'Student Portal',
    description: 'Access your academic dashboard and submit achievements',
    icon: GraduationCap,
    bgGradient: 'from-green-50 to-emerald-100',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800'
  },
  faculty: {
    title: 'Faculty Portal',
    description: 'Review student submissions and manage academic progress',
    icon: Users,
    bgGradient: 'from-blue-50 to-sky-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800'
  },
  admin: {
    title: 'Admin Portal',
    description: 'System administration and comprehensive management tools',
    icon: Shield,
    bgGradient: 'from-purple-50 to-violet-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-800'
  }
};

export function RoleSpecificSignInPage() {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  
  // Default to student if no role specified or invalid role
  const currentRole = role && roleConfigs[role] ? role : 'student';
  const config = roleConfigs[currentRole];
  const IconComponent = config.icon;

  const handleBackToSelection = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 bg-gradient-to-br ${config.bgGradient}`}>
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToSelection}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Role Selection
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`p-4 ${config.iconBg} rounded-full`}>
              <IconComponent className={`h-12 w-12 ${config.iconColor}`} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className={`text-3xl font-bold ${config.titleColor}`}>{config.title}</h1>
            <p className="text-gray-600 max-w-sm mx-auto">
              {config.description}
            </p>
          </div>
        </div>

        {/* Clerk Sign In Component */}
        <Card className="p-6 shadow-xl">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border-none",
                headerTitle: "text-xl font-semibold text-center",
                headerSubtitle: "text-muted-foreground text-center text-sm",
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
            signUpUrl={`/sign-up/${currentRole}`}
          />
        </Card>

        {/* Role-specific Help Text */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            Don't have a {currentRole} account?{' '}
            <a href={`/sign-up/${currentRole}`} className="text-primary hover:text-primary/80 font-medium">
              Sign up here
            </a>
          </p>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs">
              Need to access a different portal?{' '}
              <button 
                onClick={handleBackToSelection}
                className="text-primary hover:text-primary/80 font-medium underline"
              >
                Change role
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual role-specific pages for direct navigation
export function StudentSignInPage() {
  return <RoleSpecificSignInPage />;
}

export function FacultySignInPage() {
  return <RoleSpecificSignInPage />;
}

export function AdminSignInPage() {
  return <RoleSpecificSignInPage />;
}