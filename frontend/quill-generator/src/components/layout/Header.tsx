import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BookOpen, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

export const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 hover-scale">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">Quiz Maker</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground link-animated">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/create" className="text-sm font-medium text-foreground/80 hover:text-foreground link-animated">
                Create Quiz
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground link-animated">
                Dashboard
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hidden md:inline-flex">
                <Button variant="outline">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-primary hover:opacity-90">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <Button variant="outline" onClick={handleLogout} className="hidden md:inline-flex">
              Logout
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};