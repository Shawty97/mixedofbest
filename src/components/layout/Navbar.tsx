
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  Bot, 
  Workflow, 
  Store, 
  BookOpen, 
  Mic, 
  Sparkles, 
  Settings, 
  User, 
  LogOut,
  Home,
  BarChart3,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications] = useState(3);

  const navigationItems = [
    {
      title: "Platform",
      items: [
        { title: "Dashboard", href: "/", icon: Home, description: "Overview and quick access" },
        { title: "Core Platform", href: "/core-platform", icon: Brain, description: "AI Workflow Creator with DAG orchestration" },
        { title: "Analytics", href: "/analytics", icon: BarChart3, description: "Performance insights and metrics" },
      ]
    },
    {
      title: "AI Agents",
      items: [
        { title: "AI Studio", href: "/studio", icon: Bot, description: "Create and manage AI agents" },
        { title: "Agent Store", href: "/agent-store", icon: Store, description: "Discover and share AI agents" },
        { title: "Voice Agents", href: "/voice-agents", icon: Mic, description: "Voice-enabled AI assistants" },
      ]
    },
    {
      title: "Tools",
      items: [
        { title: "Knowledge Builder", href: "/knowledge-builder", icon: BookOpen, description: "Build intelligent knowledge bases" },
        { title: "AI Copilot", href: "/ai-copilot", icon: Sparkles, description: "AI-powered development assistant" },
        { title: "Workflow Engine", href: "/workflows", icon: Workflow, description: "Advanced workflow automation" },
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    return href !== "/" && location.pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-quantum-600 to-neural-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">AImpact</span>
          <Badge variant="secondary" className="text-xs">Platform</Badge>
        </Link>

        {/* Navigation Menu */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {navigationItems.map((section) => (
                <NavigationMenuItem key={section.title}>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    {section.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {section.items.map((item) => (
                        <NavigationMenuLink key={item.title} asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActive(item.href) && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <item.icon className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">
                                {item.title}
                              </div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Sparkles className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      User
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
