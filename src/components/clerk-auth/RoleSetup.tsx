import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateUserMetadata } from '@/hooks/useClerkUser';
import { toast } from 'sonner';
import { User, Users, Shield, GraduationCap, Crown } from 'lucide-react';

interface RoleSetupProps {
  onComplete: () => void;
}

export function RoleSetup({ onComplete }: RoleSetupProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin' | 'superadmin' | ''>('');
  const [formData, setFormData] = useState({
    department: '',
    year: '',
    studentId: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { updateStudentInfo, updateFacultyInfo, updateAdminInfo, updateSuperAdminInfo } = useUpdateUserMetadata();

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    if (!formData.department) {
      toast.error('Please enter your department');
      return;
    }

    if (selectedRole === 'student' && (!formData.year || !formData.studentId)) {
      toast.error('Please fill in all student information');
      return;
    }

    setIsLoading(true);

    try {
      switch (selectedRole) {
        case 'student':
          await updateStudentInfo({
            department: formData.department,
            year: formData.year,
            studentId: formData.studentId,
          });
          break;
        case 'faculty':
          await updateFacultyInfo({
            department: formData.department,
          });
          break;
        case 'admin':
          await updateAdminInfo({
            department: formData.department,
          });
          break;
        case 'superadmin':
          await updateSuperAdminInfo({
            department: formData.department,
          });
          break;
      }

      toast.success('Profile setup completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
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
            Tell us about your role to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Setup</CardTitle>
            <CardDescription>
              Select your role and provide additional information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Selection */}
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
            </div>

            {/* Department Input */}
            {selectedRole && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., Computer Science"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            )}

            {/* Student-specific fields */}
            {selectedRole === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Sophomore">Sophomore</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="e.g., CS2022001"
                    value={formData.studentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                  />
                </div>
              </>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={!selectedRole || isLoading}
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}