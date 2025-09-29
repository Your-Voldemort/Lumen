import { SignUp } from '@clerk/clerk-react';
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
  benefits: string[];
}

const roleConfigs: Record<string, RoleConfig> = {
  student: {
    title: 'Student Registration',
    description: 'Join the Smart Student Hub to track your academic achievements',
    icon: GraduationCap,
    bgGradient: 'from-green-50 to-emerald-100',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    benefits: [
      'Submit and track your achievements',
      'Monitor academic progress',
      'Access performance analytics',
      'Build your academic portfolio'
    ]
  },
  faculty: {
    title: 'Faculty Registration',
    description: 'Join as faculty to review and manage student progress',
    icon: Users,
    bgGradient: 'from-blue-50 to-sky-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    benefits: [
      'Review student submissions',
      'Approve achievements',
      'Monitor student progress',
      'Generate progress reports'
    ]
  },
  admin: {
    title: 'Admin Registration',
    description: 'Administrative access for system management and oversight',
    icon: Shield,
    bgGradient: 'from-purple-50 to-violet-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-800',
    benefits: [
      'Manage users and permissions',
      'Access system-wide analytics',
      'Export comprehensive reports',
      'Configure system settings'
    ]
  }
};

export function RoleSpecificSignUpPage() {
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
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-6">
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
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 ${config.iconBg} rounded-full`}>
                  <IconComponent className={`h-8 w-8 ${config.iconColor}`} />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${config.titleColor}`}>{config.title}</h1>
                  <p className="text-gray-600 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">What you'll get:</h3>
              <ul className="space-y-3">
                {config.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${config.iconColor.replace('text-', 'bg-')} rounded-full mt-2 flex-shrink-0`}></div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Info */}
            <div className={`p-4 ${config.iconBg} rounded-lg`}>
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> After registration, you'll be guided through role setup to complete your profile 
                and gain access to {currentRole}-specific features.
              </p>
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="space-y-6">
            <Card className="p-6 shadow-xl">
              <SignUp 
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
                redirectUrl="/setup"
                signInUrl={`/sign-in/${currentRole}`}
              />
            </Card>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>
                Already have a {currentRole} account?{' '}
                <a href={`/sign-in/${currentRole}`} className="text-primary hover:text-primary/80 font-medium">
                  Sign in here
                </a>
              </p>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs">
                  Need to register for a different role?{' '}
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
      </div>
    </div>
  );
}

// Individual role-specific pages for direct navigation
export function StudentSignUpPage() {
  return <RoleSpecificSignUpPage />;
}

export function FacultySignUpPage() {
  return <RoleSpecificSignUpPage />;
}

export function AdminSignUpPage() {
  return <RoleSpecificSignUpPage />;
}