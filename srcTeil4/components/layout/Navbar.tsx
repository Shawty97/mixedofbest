import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await logout();
  };

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Core Platform", path: "/core-platform" },
    { name: "Studio", path: "/studio" },
    { name: "Agent Store", path: "/agent-store" },
    { name: "Voice Agents", path: "/voice-agents" },
    { name: "Knowledge Builder", path: "/knowledge-builder" },
    { name: "AI Copilot", path: "/ai-copilot" },
    { name: "Docs", path: "/docs" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="h-8 w-8 bg-gradient-to-r from-quantum-600 to-neural-600 rounded-md flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">A</span>
              </span>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-quantum-600 to-neural-600">
                AImpact
              </span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-quantum-600 dark:hover:text-quantum-400"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="mr-4 flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  className="mr-4 flex items-center"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="ml-1"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <div className="md:hidden ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="Open menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!user && (
              <Link
                to="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
