
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  PenTool, 
  Store, 
  Server, 
  Rocket, 
  BarChart3, 
  Briefcase,
  Heart,
  CreditCard,
  Home,
  MessageSquare,
  Settings
} from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ai-purple to-ai-blue animate-pulse-glow"></div>
          <span className="text-xl font-bold">AImpact</span>
        </div>
        <nav className="ml-auto flex gap-1 md:gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-sm md:text-base flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="ghost" className="text-sm md:text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          </Link>
          <Link to="/templates">
            <Button variant="ghost" className="text-sm md:text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link to="/healthcare">
            <Button variant="ghost" className="text-sm md:text-base flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Healthcare
            </Button>
          </Link>
          <Link to="/billing">
            <Button variant="ghost" className="text-sm md:text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </Button>
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <span className="h-6 w-6 rounded-full bg-gradient-to-br from-ai-pink to-ai-purple"></span>
                <span className="hidden md:inline">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <Link to="/settings">
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </Link>
              <DropdownMenuItem>API Keys</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

const systemNavItems = [
  { name: 'Studio', href: '/studio', icon: PenTool },
  { name: 'Store', href: '/store', icon: Store },
  { name: 'Engine', href: '/engine', icon: Server },
  { name: 'Deploy', href: '/deploy', icon: Rocket },
  { name: 'Observability', href: '/observability', icon: BarChart3 },
  { name: 'Templates', href: '/templates', icon: Briefcase },
];
