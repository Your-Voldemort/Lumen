import { memo, useCallback } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface UserManagementFormProps {
  formData: {
    name: string;
    email: string;
    role: "student" | "faculty" | "admin";
    department: string;
    year: string;
    studentId: string;
  };
  onChange: (field: string, value: string) => void;
}

export const UserManagementForm = memo(({ formData, onChange }: UserManagementFormProps) => {
  // Helper function to handle role changes and clear dependent fields
  const handleRoleChange = useCallback((newRole: "student" | "faculty" | "admin") => {
    onChange('role', newRole);
    // Clear student-specific fields when role is not student
    if (newRole !== 'student') {
      onChange('year', '');
      onChange('studentId', '');
    }
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Enter full name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="Enter email address"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => onChange('department', e.target.value)}
          placeholder="Enter department"
        />
      </div>
      
      {formData.role === 'student' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={formData.year} onValueChange={(value) => onChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Freshman">Freshman</SelectItem>
                <SelectItem value="Sophomore">Sophomore</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => onChange('studentId', e.target.value)}
              placeholder="Enter student ID"
            />
          </div>
        </>
      )}
    </div>
  );
});

UserManagementForm.displayName = 'UserManagementForm';