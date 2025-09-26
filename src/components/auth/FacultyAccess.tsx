import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Users, Lock, ArrowLeft, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { User } from "../../App";

interface FacultyAccessProps {
  onLogin: (user: User) => void;
  users?: User[];
}

export function FacultyAccess({ onLogin, users = [] }: FacultyAccessProps) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Demo faculty account
  const demoFaculty = {
    id: "2",
    name: "Dr. Emily Chen",
    email: "emily.chen@university.edu",
    role: 'faculty' as const,
    department: "Computer Science"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (!credentials.email || !credentials.password) {
        toast.error("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      // Check if faculty exists in users database
      const facultyUser = users.find(user => 
        user.email === credentials.email && user.role === 'faculty'
      );

      if (facultyUser && credentials.password === "faculty123") {
        onLogin(facultyUser);
        toast.success(`Welcome back, ${facultyUser.name}!`);
        navigate("/");
      } else if (credentials.email === demoFaculty.email && credentials.password === "faculty123") {
        // Fallback to demo account
        onLogin(demoFaculty);
        toast.success("Welcome back, Dr. Chen!");
        navigate("/");
      } else {
        toast.error("Invalid faculty credentials");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Check if demo faculty exists in users database
      const existingFaculty = users.find(user => 
        user.email === demoFaculty.email && user.role === 'faculty'
      );
      
      if (existingFaculty) {
        onLogin(existingFaculty);
        toast.success(`Logged in as ${existingFaculty.name}`);
      } else {
        onLogin(demoFaculty);
        toast.success("Logged in as Demo Faculty");
      }
      navigate("/");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100">
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
            <div className="p-3 bg-blue-600 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Faculty Portal</h1>
          <p className="text-muted-foreground">
            Access the faculty review and management system
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Authentication</CardTitle>
            <CardDescription>
              Enter your faculty credentials to access student submissions
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Faculty Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="faculty@university.edu"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isLoading ? "Authenticating..." : "Login as Faculty"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Access Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Demo Faculty Access</CardTitle>
            <CardDescription>
              Try the faculty portal with demo credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-semibold">Dr. Emily Chen</p>
                <p className="text-muted-foreground">Department: Computer Science</p>
                <p className="text-muted-foreground">Email: emily.chen@university.edu</p>
                <p className="text-muted-foreground">Password: faculty123</p>
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

        {/* Faculty Features */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Faculty Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Review and approve student submissions
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Provide detailed feedback on activities
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Access student directory and records
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Advanced search and filtering tools
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Generate performance analytics
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Faculty portal access is restricted to authorized personnel only. 
            All activities are logged for security and compliance purposes.
          </p>
        </div>
      </div>
    </div>
  );
}