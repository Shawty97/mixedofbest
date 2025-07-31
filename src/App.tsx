
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";

// Universal Agent Platform Pages
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { UniversalStudio } from "./pages/UniversalStudio";
import { AgentMarketplace } from "./pages/AgentMarketplace"; 
import AgentDeployment from "./pages/AgentDeployment";
import AgentMonitoring from "./pages/AgentMonitoring";
import { QuantumLab } from "./pages/QuantumLab";
import KnowledgeBuilder from "./pages/KnowledgeBuilder";
import VoiceAgents from "./pages/VoiceAgents";
import AICopilot from "./pages/AICopilot";
import Workflows from "./pages/Workflows";
import NotFound from "./pages/NotFound";

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
            <main className="pt-16">
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
