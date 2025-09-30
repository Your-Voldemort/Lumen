import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from '@clerk/clerk-react';
import App from "./App";
import { RoleSelectionPage } from "./components/auth/RoleSelectionPage";
import { RoleSpecificSignInPage } from "./components/auth/RoleSpecificSignInPage";
import { RoleSpecificSignUpPage } from "./components/auth/RoleSpecificSignUpPage";
import { SupabaseRoleSetup } from "./components/supabase-auth/SupabaseRoleSetup";
import { ProtectedRoute } from "./components/clerk-auth/ProtectedRoute";
import { useSupabaseUser } from "./hooks/useSupabaseUser";
import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import type { Activity } from "./App";

export default function ClerkAppRouter() {
  const { isLoaded, isSignedIn } = useUser();
  const { user, needsProfileSetup } = useSupabaseUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedActivities = localStorage.getItem('activities');
      const savedUsers = localStorage.getItem('users');
      
      if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities);
        if (Array.isArray(parsedActivities)) {
          setActivities(parsedActivities);
        } else {
          initializeSampleData();
        }
      } else {
        initializeSampleData();
      }

      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers)) {
          setUsers(parsedUsers);
        } else {
          initializeSampleUsers();
        }
      } else {
        initializeSampleUsers();
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      initializeSampleData();
      initializeSampleUsers();
    }
  }, []);

  // Check if user needs role setup
  useEffect(() => {
    if (isSignedIn && user) {
      // User profile is loaded from Supabase, no additional checks needed
      // needsProfileSetup is handled by the useSupabaseUser hook
    }
  }, [isSignedIn, user]);

  const initializeSampleData = () => {
    const sampleActivities: Activity[] = [
      {
        id: "1",
        title: "React Workshop Completion",
        type: "Workshop",
        description: "Completed advanced React development workshop covering hooks, context, and performance optimization",
        date: "2024-12-15",
        studentId: "CS2022001",
        studentName: "John Smith",
        fileName: "react_workshop_certificate.pdf",
        status: "pending",
        submittedAt: "2024-12-16T10:30:00Z"
      },
      {
        id: "2",
        title: "Machine Learning Certification",
        type: "Certificate",
        description: "Completed online certification in Machine Learning fundamentals from Stanford University",
        date: "2024-11-28",
        studentId: "CS2022002",
        studentName: "Sarah Johnson",
        fileName: "ml_certificate.pdf",
        status: "approved",
        submittedAt: "2024-11-29T14:20:00Z",
        reviewedAt: "2024-11-30T09:15:00Z",
        reviewedBy: "Dr. Emily Chen",
        comments: "Excellent work! This certification demonstrates strong understanding of ML concepts."
      }
    ];
    setActivities(sampleActivities);
    try {
      localStorage.setItem('activities', JSON.stringify(sampleActivities));
    } catch (error) {
      console.error('Error saving sample data to localStorage:', error);
    }
  };

  const initializeSampleUsers = () => {
    const sampleUsers = [
      {
        id: "1",
        name: "John Smith",
        email: "john.smith@university.edu",
        role: 'student',
        department: "Computer Science",
        year: "Senior",
        studentId: "CS2022001"
      },
      {
        id: "2",
        name: "Dr. Emily Chen",
        email: "emily.chen@university.edu",
        role: 'faculty',
        department: "Computer Science"
      },
      {
        id: "3",
        name: "Michael Johnson",
        email: "michael.johnson@university.edu",
        role: 'admin',
        department: "Administration"
      }
    ];
    setUsers(sampleUsers);
    try {
      localStorage.setItem('users', JSON.stringify(sampleUsers));
    } catch (error) {
      console.error('Error saving sample users to localStorage:', error);
    }
  };

  const handleRoleSetupComplete = () => {
    // No longer needed - useSupabaseUser handles this automatically
    window.location.reload();
  };

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Role Selection Landing Page */}
        <Route 
          path="/" 
          element={
            isSignedIn ? (
              <ProtectedRoute redirectTo="/select-role">
                {needsProfileSetup ? (
                  <Navigate to="/setup" replace />
                ) : (
                  <>
                    <App 
                      currentUser={user}
                      setCurrentUser={() => {}} // Not needed with Supabase
                      activities={activities}
                      setActivities={setActivities}
                      users={users}
                      setUsers={setUsers}
                      onLogout={() => {}} // Handled by Clerk
                    />
                    <Toaster position="bottom-right" />
                  </>
                )}
              </ProtectedRoute>
            ) : (
              <Navigate to="/select-role" replace />
            )
          } 
        />

        {/* Role Selection Page */}
        <Route 
          path="/select-role" 
          element={
            isSignedIn ? <Navigate to="/" replace /> : <RoleSelectionPage />
          } 
        />

        {/* Role-specific Sign In routes */}
        <Route 
          path="/sign-in/:role" 
          element={
            isSignedIn ? <Navigate to="/" replace /> : <RoleSpecificSignInPage />
          } 
        />
        
        {/* Legacy sign-in route - redirect to role selection */}
        <Route 
          path="/sign-in" 
          element={
            isSignedIn ? <Navigate to="/" replace /> : <Navigate to="/select-role" replace />
          } 
        />

        {/* Role-specific Sign Up routes */}
        <Route 
          path="/sign-up/:role" 
          element={
            isSignedIn ? <Navigate to="/" replace /> : <RoleSpecificSignUpPage />
          } 
        />
        
        {/* Legacy sign-up route - redirect to role selection */}
        <Route 
          path="/sign-up" 
          element={
            isSignedIn ? <Navigate to="/" replace /> : <Navigate to="/select-role" replace />
          } 
        />

        {/* Role setup route */}
        <Route 
          path="/setup" 
          element={
            <ProtectedRoute redirectTo="/select-role">
              {needsRoleSetup ? (
                <RoleSetup onComplete={handleRoleSetupComplete} />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          } 
        />

        {/* Legacy direct access routes - redirect to role-specific sign-in */}
        <Route 
          path="/student-access" 
          element={
            isSignedIn ? <Navigate to="/" replace /> : <Navigate to="/sign-in/student" replace />
          } 
        />
        <Route 
          path="/faculty-access" 
          element={
            isSignedIn ? <Navigate to="/" replace /> : <Navigate to="/sign-in/faculty" replace />
          } 
        />
        <Route 
          path="/admin-access" 
          element={
            isSignedIn ? <Navigate to="/" replace /> : <Navigate to="/sign-in/admin" replace />
          } 
        />
        
        {/* Default redirect to role selection */}
        <Route path="*" element={<Navigate to="/select-role" replace />} />
      </Routes>
    </Router>
  );
}