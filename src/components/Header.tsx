import { useState, useEffect } from "react";
import { Bell, Search, Settings, BookOpen, Trophy, BarChart3, Crown, Shield, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { GlobalSearch } from "./shared/GlobalSearch";
import { ClerkAuthButton } from "./clerk-auth/ClerkAuthButton";
import type { User, Activity } from "../App";

interface HeaderProps {
  currentUser?: User;
  activities?: Activity[];
  allUsers?: User[];
  onNavigate?: (path: string) => void;
  onAction?: (actionId: string, payload?: any) => void;
}

export function Header({ 
  currentUser, 
  activities = [], 
  allUsers = [], 
  onNavigate,
  onAction 
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">Smart Student Hub</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {/* Common navigation for all users */}
          <Button variant="ghost" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
          
          {/* Role-specific navigation */}
          {currentUser?.role === 'superadmin' && (
            <>
              <Button variant="ghost" className="flex items-center gap-2 text-red-600">
                <Crown className="h-4 w-4" />
                Super Admin
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System Control
              </Button>
            </>
          )}
          
          {currentUser?.role === 'admin' && (
            <>
              <Button variant="ghost" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Reports
              </Button>
            </>
          )}
          
          {(currentUser?.role === 'student' || currentUser?.role === 'faculty') && (
            <>
              <Button variant="ghost" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Records
              </Button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Enhanced Search */}
          <Button
            variant="outline"
            className="relative hidden sm:flex items-center gap-2 w-64 justify-start text-muted-foreground"
            onClick={handleSearchClick}
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search everything...</span>
            <div className="flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ⌘K
              </kbd>
            </div>
          </Button>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={handleSearchClick}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>

          {/* Clerk Authentication UI */}
          <ClerkAuthButton />
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        activities={activities}
        users={allUsers}
        currentUserRole={currentUser?.role || 'student'}
        onNavigate={onNavigate}
        onAction={onAction}
      />
    </header>
  );
}