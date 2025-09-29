import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClerkUser } from '@/hooks/useClerkUser';
import { 
  Crown, 
  Users, 
  Database, 
  Settings, 
  Shield, 
  Activity, 
  BarChart3, 
  FileText,
  AlertTriangle,
  Zap,
  Lock,
  Server
} from 'lucide-react';
import { useState } from 'react';

export function SuperAdminDashboard() {
  const { user } = useClerkUser();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const systemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalActivities: 5634,
    systemUptime: '99.8%',
    storageUsed: '2.3GB',
    apiRequests: 15420
  };

  const recentAlerts = [
    { id: 1, type: 'warning', message: 'High API usage detected', time: '2 min ago' },
    { id: 2, type: 'info', message: 'Database backup completed', time: '1 hour ago' },
    { id: 3, type: 'error', message: 'Failed login attempts from IP: 192.168.1.100', time: '3 hours ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Console</h1>
            <p className="text-gray-600">Master control panel for system administration</p>
          </div>
        </div>
        <Badge variant="destructive" className="bg-red-600">
          <Crown className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats.systemUptime}</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.storageUsed}</div>
            <p className="text-xs text-muted-foreground">Used of 10GB</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              API Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.apiRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'system', label: 'System Config', icon: Settings },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'logs', label: 'System Logs', icon: FileText }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center space-x-2"
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  System Overview
                </CardTitle>
                <CardDescription>
                  Real-time system performance and usage metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active Sessions</span>
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mt-2">342</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Activities Today</span>
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600 mt-2">156</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="justify-start">
                        <Database className="h-4 w-4 mr-2" />
                        Backup Database
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Server className="h-4 w-4 mr-2" />
                        Restart Services
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management Console
                </CardTitle>
                <CardDescription>
                  Advanced user administration and role management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Button className="h-20 flex-col space-y-2" variant="outline">
                      <Users className="h-6 w-6" />
                      <span>Manage Users</span>
                    </Button>
                    <Button className="h-20 flex-col space-y-2" variant="outline">
                      <Shield className="h-6 w-6" />
                      <span>Role Permissions</span>
                    </Button>
                    <Button className="h-20 flex-col space-y-2" variant="outline">
                      <Crown className="h-6 w-6" />
                      <span>Grant Admin Access</span>
                    </Button>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Super Admin Actions</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      These actions have system-wide impact. Use with caution.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-16 flex-col">
                      <Server className="h-6 w-6 mb-2" />
                      Server Settings
                    </Button>
                    <Button variant="outline" className="h-16 flex-col">
                      <Database className="h-6 w-6 mb-2" />
                      Database Config
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        alert.type === 'error' ? 'bg-red-500' : 
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Super Admin Info */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-red-700">
                <Crown className="h-5 w-5 mr-2" />
                Super Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">User:</span>
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Role:</span>
                  <Badge variant="destructive">Super Admin</Badge>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-700">
                    You have full system access. All actions are logged and monitored.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}