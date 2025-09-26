import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Shield, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { User } from "../../App";

interface AdminAccessProps {
  onLogin: (user: User) => void;
}

export function AdminAccess({ onLogin }: AdminAccessProps) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Demo admin account
  const demoAdmin = {
    id: "3",
    name: "Michael Johnson",
    email: "michael.johnson@university.edu",
    role: 'admin' as const,
    department: "Administration"
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

      // For demo purposes, check against demo admin credentials
      if (credentials.email === demoAdmin.email && credentials.password === "admin123") {
        onLogin(demoAdmin);
        toast.success("Welcome back, Administrator!");
        navigate("/");
      } else {
        toast.error("Invalid admin credentials");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(demoAdmin);
      toast.success("Logged in as Demo Administrator");
      navigate("/");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100">
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
            <div className="p-3 bg-purple-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Administrator Access</h1>
          <p className="text-muted-foreground">
            Secure portal for system administrators
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>
              Enter your administrator credentials to access the system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@university.edu"
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
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isLoading ? "Authenticating..." : "Login as Administrator"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Access Card */}
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Demo Access</CardTitle>
            <CardDescription>
              Try the admin panel with demo credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-semibold">Demo Administrator</p>
                <p className="text-muted-foreground">Email: michael.johnson@university.edu</p>
                <p className="text-muted-foreground">Password: admin123</p>
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

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This is a secure administrative portal. All login attempts are logged and monitored.
            Unauthorized access attempts will be reported.
          </p>
        </div>
      </div>
    </div>
  );
}