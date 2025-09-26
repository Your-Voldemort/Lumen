import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { GraduationCap, Lock, ArrowLeft, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { User } from "../../App";

interface StudentAccessProps {
  onLogin: (user: User) => void;
  users?: User[];
}

export function StudentAccess({ onLogin, users = [] }: StudentAccessProps) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    studentId: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Demo student account
  const demoStudent = {
    id: "1",
    name: "John Smith",
    email: "john.smith@university.edu",
    role: 'student' as const,
    department: "Computer Science",
    year: "Senior",
    studentId: "CS2022001"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (!credentials.email || !credentials.studentId) {
        toast.error("Please enter both email and student ID");
        setIsLoading(false);
        return;
      }

      // Check if student exists in users database
      const studentUser = users.find(user => 
        user.email === credentials.email && 
        user.role === 'student' && 
        user.studentId === credentials.studentId
      );

      if (studentUser) {
        onLogin(studentUser);
        toast.success(`Welcome back, ${studentUser.name}!`);
        navigate("/");
      } else if (credentials.email === demoStudent.email && credentials.studentId === demoStudent.studentId) {
        // Fallback to demo account
        onLogin(demoStudent);
        toast.success("Welcome back, John!");
        navigate("/");
      } else {
        toast.error("Invalid student credentials. Please check your email and student ID.");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Check if demo student exists in users database
      const existingStudent = users.find(user => 
        user.email === demoStudent.email && user.role === 'student'
      );
      
      if (existingStudent) {
        onLogin(existingStudent);
        toast.success(`Logged in as ${existingStudent.name}`);
      } else {
        onLogin(demoStudent);
        toast.success("Logged in as Demo Student");
      }
      navigate("/");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Main Login
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-green-600 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Student Portal</h1>
          <p className="text-muted-foreground">
            Submit and track your academic achievements
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Student Authentication</CardTitle>
            <CardDescription>
              Enter your credentials to access your achievement dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Student Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="CS2022001"
                  value={credentials.studentId}
                  onChange={(e) => setCredentials({ ...credentials, studentId: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isLoading ? "Authenticating..." : "Login as Student"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Access Card */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Demo Student Access</CardTitle>
            <CardDescription>
              Try the student portal with demo credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-semibold">John Smith</p>
                <p className="text-muted-foreground">Department: Computer Science</p>
                <p className="text-muted-foreground">Email: john.smith@university.edu</p>
                <p className="text-muted-foreground">Student ID: CS2022001</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleDemoLogin}
              variant="secondary" 
              className="w-full"
              disabled={isLoading}
            >
              Quick Demo Login
            </Button>
          </CardFooter>
        </Card>

        {/* Student Features */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Student Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Submit academic achievements
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Upload certificates and proofs
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Track submission status
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                View faculty feedback
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Generate achievement reports
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Student portal access is restricted to registered students only. 
            Please contact your department if you're having trouble logging in.
          </p>
        </div>
      </div>
    </div>
  );
}