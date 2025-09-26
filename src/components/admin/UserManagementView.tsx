import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { SearchWithSuggestions } from "../shared/SearchWithSuggestions";
import { FilterChips } from "../shared/FilterChips";
import { UserFormDialog } from "./UserFormDialog";
import { UserPlus, Edit2, Trash2, Users, Shield, GraduationCap, Filter } from "lucide-react";
import { toast } from "sonner";
import { useSearch } from "../../hooks/useSearch";
import { useFilters, type FilterConfig } from "../../hooks/useFilters";
import type { User } from "../../App";
interface UserManagementViewProps {
  users: User[];
  onAddUser: (userData: Omit<User, 'id'>) => void;
  onUpdateUser: (userId: string, userData: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserManagementView({ users, onAddUser, onUpdateUser, onDeleteUser }: UserManagementViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student" as "student" | "faculty" | "admin",
    department: "",
    year: "",
    studentId: ""
  });

  // Memoize the form change handler to prevent unnecessary re-renders
  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Filter configuration for the enhanced filtering system - memoized
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: 'role',
      label: 'Role',
      type: 'select',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'student', label: 'Students' },
        { value: 'faculty', label: 'Faculty' },
        { value: 'admin', label: 'Admins' }
      ]
    },
    {
      id: 'department',
      label: 'Department',
      type: 'select',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'All Departments' },
        ...Array.from(new Set(users.filter(u => u.department).map(u => u.department))).map(dept => ({
          value: dept!,
          label: dept!
        }))
      ]
    },
    {
      id: 'year',
      label: 'Academic Year',
      type: 'select',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'All Years' },
        { value: 'Freshman', label: 'Freshman' },
        { value: 'Sophomore', label: 'Sophomore' },
        { value: 'Junior', label: 'Junior' },
        { value: 'Senior', label: 'Senior' }
      ]
    }
  ], [users]);

  // Enhanced search hook
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: searchFilteredUsers,
    searchSuggestions,
    searchHistory,
    clearHistory
  } = useSearch(users, {
    searchFields: ['name', 'email', 'studentId', 'department'],
    debounceMs: 200
  });

  // Enhanced filters hook
  const {
    filteredItems: finalFilteredUsers,
    activeFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    saveCurrentFilters,
    loadSavedFilter,
    deleteSavedFilter,
    savedFilters,
    filters
  } = useFilters(searchFilteredUsers, filterConfigs);

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('');
    clearAllFilters();
  }, [setSearchTerm, clearAllFilters]);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      role: "student",
      department: "",
      year: "",
      studentId: ""
    });
  }, []);

  // Memoize dialog action callbacks to prevent re-renders
  const handleCancelAddDialog = useCallback(() => {
    setShowAddDialog(false);
    resetForm();
  }, [resetForm]);

  const handleCancelEditDialog = useCallback(() => {
    setEditingUser(null);
    resetForm();
  }, [resetForm]);

  const handleAddUser = useCallback(() => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department || undefined,
      year: formData.year || undefined,
      studentId: formData.studentId || undefined
    };

    onAddUser(userData);
    setShowAddDialog(false);
    resetForm();
    toast.success("User added successfully");
  }, [formData, onAddUser, resetForm]);

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      year: user.year || "",
      studentId: user.studentId || ""
    });
  }, []);

  const handleUpdateUser = useCallback(() => {
    if (!editingUser || !formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department || undefined,
      year: formData.year || undefined,
      studentId: formData.studentId || undefined
    };

    onUpdateUser(editingUser.id, userData);
    setEditingUser(null);
    resetForm();
    toast.success("User updated successfully");
  }, [editingUser, formData, onUpdateUser, resetForm]);

  const handleDeleteUser = useCallback((user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      onDeleteUser(user.id);
      toast.success("User deleted successfully");
    }
  }, [onDeleteUser]);

  const getRoleIcon = useCallback((role: string) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      case 'faculty':
        return <Users className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  }, []);

  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'faculty':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Memoize user counts to prevent recalculation on every render
  const userCounts = useMemo(() => ({
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    faculty: users.filter(u => u.role === 'faculty').length,
    admin: users.filter(u => u.role === 'admin').length,
    byDepartment: users.reduce((acc, u) => {
      if (u.department) {
        acc[u.department] = (acc[u.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    byYear: {
      Freshman: users.filter(u => u.year === 'Freshman').length,
      Sophomore: users.filter(u => u.year === 'Sophomore').length,
      Junior: users.filter(u => u.year === 'Junior').length,
      Senior: users.filter(u => u.year === 'Senior').length
    }
  }), [users]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCounts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCounts.students}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCounts.faculty}</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Enhanced User Search & Filter
          </CardTitle>
          <CardDescription>
            Search and filter user accounts with advanced options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enhanced Search and Bulk Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <SearchWithSuggestions
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={setSearchTerm}
                placeholder="Search users by name, email, student ID, or department..."
                suggestions={searchSuggestions}
                searchHistory={searchHistory}
                onClearHistory={clearHistory}
                maxSuggestions={6}
                maxHistory={4}
              />
            </div>
            
            {/* Bulk Actions (Future Enhancement) */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <Users className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students ({userCounts.students})</SelectItem>
                <SelectItem value="faculty">Faculty ({userCounts.faculty})</SelectItem>
                <SelectItem value="admin">Admins ({userCounts.admin})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.department} onValueChange={(value) => updateFilter('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Array.from(new Set(users.filter(u => u.department).map(u => u.department))).map(dept => (
                  <SelectItem key={dept} value={dept!}>
                    {dept} ({userCounts.byDepartment[dept!] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.year} onValueChange={(value) => updateFilter('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="Freshman">Freshman ({userCounts.byYear.Freshman})</SelectItem>
                <SelectItem value="Sophomore">Sophomore ({userCounts.byYear.Sophomore})</SelectItem>
                <SelectItem value="Junior">Junior ({userCounts.byYear.Junior})</SelectItem>
                <SelectItem value="Senior">Senior ({userCounts.byYear.Senior})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Chips */}
          <FilterChips
            activeFilters={activeFilters}
            savedFilters={savedFilters}
            onClearFilter={clearFilter}
            onClearAllFilters={handleClearAllFilters}
            onSaveFilters={saveCurrentFilters}
            onLoadSavedFilter={loadSavedFilter}
            onDeleteSavedFilter={deleteSavedFilter}
            showSaveFilters={true}
          />

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Additional Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalFilteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getRoleColor(user.role)}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      {user.role === 'student' && (
                        <div className="text-sm">
                          {user.year && <div>Year: {user.year}</div>}
                          {user.studentId && <div>ID: {user.studentId}</div>}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {finalFilteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        isOpen={showAddDialog}
        title="Add New User"
        description="Create a new user account"
        formData={formData}
        onChange={handleFormChange}
        onCancel={handleCancelAddDialog}
        onSubmit={handleAddUser}
        submitText="Add User"
      />
      
      <UserFormDialog
        isOpen={!!editingUser}
        title="Edit User"
        description="Update user information"
        formData={formData}
        onChange={handleFormChange}
        onCancel={handleCancelEditDialog}
        onSubmit={handleUpdateUser}
        submitText="Update User"
      />
    </div>
  );
}