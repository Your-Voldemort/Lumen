import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import { AdminAccess } from "./components/auth/AdminAccess";
import { FacultyAccess } from "./components/auth/FacultyAccess";
import { StudentAccess } from "./components/auth/StudentAccess";
import { LoginForm } from "./components/auth/LoginForm";
import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import type { User, Activity } from "./App";

export default function AppRouter() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const savedActivities = localStorage.getItem('activities');
      const savedUsers = localStorage.getItem('users');
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setCurrentUser(parsedUser);
        }
      }
      
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
    const sampleUsers: User[] = [
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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Main application route */}
        <Route 
          path="/" 
          element={
            <App 
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              activities={activities}
              setActivities={setActivities}
              users={users}
              setUsers={setUsers}
              onLogout={handleLogout}
            />
          } 
        />
        
        {/* Admin access route */}
        <Route 
          path="/admin-access" 
          element={
            currentUser?.role === 'admin' ? (
              <Navigate to="/" replace />
            ) : (
              <>
                <AdminAccess onLogin={handleLogin} />
                <Toaster position="bottom-right" />
              </>
            )
          } 
        />
        
        {/* Faculty access route */}
        <Route 
          path="/faculty-access" 
          element={
            currentUser?.role === 'faculty' ? (
              <Navigate to="/" replace />
            ) : (
              <>
                <FacultyAccess onLogin={handleLogin} users={users} />
                <Toaster position="bottom-right" />
              </>
            )
          } 
        />
        
        {/* Student access route */}
        <Route 
          path="/student-access" 
          element={
            currentUser?.role === 'student' ? (
              <Navigate to="/" replace />
            ) : (
              <>
                <StudentAccess onLogin={handleLogin} users={users} />
                <Toaster position="bottom-right" />
              </>
            )
          } 
        />
        
        {/* Default redirect to main page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}