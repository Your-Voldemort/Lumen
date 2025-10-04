import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { toast } from 'sonner';
import { User, Users, Shield, GraduationCap, Crown } from 'lucide-react';

interface SupabaseRoleSetupProps {
  onComplete: () => void;
}

export function SupabaseRoleSetup({ onComplete }: SupabaseRoleSetupProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin' | 'superadmin' | ''>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    year: '',
    studentId: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { createUserProfile } = useSupabaseUser();

  // Load pre-selected role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('selectedRole');
    if (storedRole && ['student', 'faculty', 'admin'].includes(storedRole)) {
      setSelectedRole(storedRole as 'student' | 'faculty' | 'admin');
      // Clear the stored role after using it
      localStorage.removeItem('selectedRole');
    }
  }, []);

  // Debug mode: Skip setup if localStorage flag is set
  useEffect(() => {
    if (import.meta.env.DEV && localStorage.getItem('debug_skip_setup') === 'true') {
      console.log('Debug: Skipping setup');
      setTimeout(() => {
        localStorage.removeItem('debug_skip_setup');
        onComplete();
      }, 1000);
    }
  }, [onComplete]);

  // Add keyboard shortcut for emergency bypass
  useEffect(() => {
    if (import.meta.env.DEV) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'X') {
          console.log('Manual setup override triggered');
          localStorage.setItem('debug_skip_setup', 'true');
          window.location.reload();
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  const handleSubmit = async () => {
    console.log('Setup form submitted with data:', { selectedRole, formData });
    
    // Trim whitespace and validate
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const department = formData.department.trim();
    
    if (!selectedRole) {
      console.log('Error: No role selected');
      toast.error('Please select a role');
      return;
    }

    if (!firstName || !lastName || !department) {
      console.log('Error: Missing required fields', { 
        firstName: !!firstName, 
        lastName: !!lastName, 
        department: !!department 
      });
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedRole === 'student') {
      const year = formData.year.trim();
      const studentId = formData.studentId.trim();
      
      if (!year || !studentId) {
        console.log('Error: Missing student fields', { 
          year: !!year, 
          studentId: !!studentId 
        });
        toast.error('Please fill in all student information');
        return;
      }
    }

    setIsLoading(true);
    console.log('Starting profile creation...');

    try {
      const result = await createUserProfile({
        firstName,
        lastName,
        role: selectedRole,
        department,
        year: selectedRole === 'student' ? formData.year.trim() : undefined,
        studentId: selectedRole === 'student' ? formData.studentId.trim() : undefined,
      });

      console.log('Profile creation successful:', result);
      toast.success('Profile setup completed!');
      
      // Add delay before calling onComplete to ensure state updates
      setTimeout(() => {
        onComplete();
      }, 500);
      
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Setup failed. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Tell us about yourself to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Setup</CardTitle>
            <CardDescription>
              Select your role and provide your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Select Your Role</Label>
              <div className="grid grid-cols-1 gap-3">
                <div
                  onClick={() => setSelectedRole('student')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'student'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Student</h3>
                      <p className="text-sm text-muted-foreground">Submit and track activities</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedRole('faculty')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'faculty'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Faculty</h3>
                      <p className="text-sm text-muted-foreground">Review and approve submissions</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedRole('admin')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'admin'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Administrator</h3>
                      <p className="text-sm text-muted-foreground">Manage users and generate reports</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedRole('superadmin')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'superadmin'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Crown className="h-6 w-6 text-red-600" />
                    <div>
                      <h3 className="font-semibold">Super Administrator</h3>
                      <p className="text-sm text-muted-foreground">Master access to all system functions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Input */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            {/* Student-specific fields */}
            {selectedRole === 'student' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Input
                    id="year"
                    placeholder="e.g., 2024"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="e.g., CS2024001"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isLoading || !selectedRole || !formData.firstName.trim() || !formData.lastName.trim() || !formData.department.trim()}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
            
            {import.meta.env.DEV && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Dev mode: Press Ctrl+Shift+X to skip setup
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}