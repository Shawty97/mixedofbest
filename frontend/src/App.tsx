
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { Bot, BarChart3, Workflow, Mic, Home, Menu, X, Settings, User } from 'lucide-react';

// Universal Agent Platform Pages
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { UniversalStudio } from "./pages/UniversalStudio";
import { AgentMarketplace } from "./pages/AgentMarketplace"; 
import AgentDeployment from "./pages/AgentDeployment";
import AgentMonitoring from "./pages/AgentMonitoring";
import QuantumLab from "./pages/QuantumLab";
import KnowledgeBuilder from "./pages/KnowledgeBuilder";
import VoiceAgents from "./pages/VoiceAgents";
import AICopilot from "./pages/AICopilot";
import Workflows from "./pages/Workflows";
import Billing from "./pages/Billing";
import Healthcare from "./pages/Healthcare";
import Templates from "./pages/Templates";
import NotFound from "./pages/NotFound";

function NavigationItem({ to, icon: Icon, children, isActive }: { to: string; icon: any; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {children}
    </Link>
  );
}

function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/agents', icon: Bot, label: 'Agent Builder' },
    { to: '/workflows', icon: Workflow, label: 'Workflows' },
    { to: '/voice', icon: Mic, label: 'Voice Chat' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Bot className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Airwolf Platform
              </span>
              <Badge variant="secondary" className="ml-2 text-xs">
                MVP
              </Badge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                isActive={location.pathname === item.to}
              >
                {item.label}
              </NavigationItem>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  isActive={location.pathname === item.to}
                >
                  {item.label}
                </NavigationItem>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="flex-1 pt-16">
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                  <Routes>
                    <Route path="/landing" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/studio" element={
                      <ProtectedRoute>
                        <UniversalStudio />
                      </ProtectedRoute>
                    } />
                    <Route path="/marketplace" element={
                      <ProtectedRoute>
                        <AgentMarketplace />
                      </ProtectedRoute>
                    } />
                    <Route path="/deploy" element={
                      <ProtectedRoute>
                        <AgentDeployment />
                      </ProtectedRoute>
                    } />
                    <Route path="/monitor" element={
                      <ProtectedRoute>
                        <AgentMonitoring />
                      </ProtectedRoute>
                    } />
                    <Route path="/quantum" element={
                      <ProtectedRoute>
                        <QuantumLab />
                      </ProtectedRoute>
                    } />
                    <Route path="/knowledge-builder" element={
                      <ProtectedRoute>
                        <KnowledgeBuilder />
                      </ProtectedRoute>
                    } />
                    <Route path="/voice-agents" element={
                      <ProtectedRoute>
                        <VoiceAgents />
                      </ProtectedRoute>
                    } />
                    <Route path="/ai-copilot" element={
                      <ProtectedRoute>
                        <AICopilot />
                      </ProtectedRoute>
                    } />
                    <Route path="/workflows" element={
                      <ProtectedRoute>
                        <Workflows />
                      </ProtectedRoute>
                    } />
                    <Route path="/billing" element={
                      <ProtectedRoute>
                        <Billing />
                      </ProtectedRoute>
                    } />
                    <Route path="/healthcare" element={
                  <ProtectedRoute>
                    <Healthcare />
                  </ProtectedRoute>
                } />
                <Route path="/templates" element={
                  <ProtectedRoute>
                    <Templates />
                  </ProtectedRoute>
                } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/50">
              <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-muted-foreground">
                      © 2024 Airwolf Platform. Built for investors demo.
                    </p>
                    <Badge variant="outline" className="text-xs">
                      v1.0.0-mvp
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground">System Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
