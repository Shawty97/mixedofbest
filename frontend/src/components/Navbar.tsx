
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PenTool, Store, Server, Rocket, BarChart3 } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ai-purple to-ai-blue animate-pulse-glow"></div>
          <span className="text-xl font-bold">AImpact</span>
        </div>
        <nav className="ml-auto flex gap-1 md:gap-2">
          <Button variant="ghost" className="text-sm md:text-base">Dashboard</Button>
          <Button variant="ghost" className="text-sm md:text-base">Agents</Button>
          <Button variant="ghost" className="text-sm md:text-base">Marketplace</Button>
          <Button variant="ghost" className="text-sm md:text-base">Settings</Button>
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
              <DropdownMenuItem>Settings</DropdownMenuItem>
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
];
