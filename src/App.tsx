import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// System Layer Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 1. Agent Studio (Builder UI)
import Studio from "./pages/Studio";

// 2. Agent Store (Template Registry)
import AgentStore from "./pages/AgentStore";

// 3. Agent Engine (Executor) - Runtime Management
import AgentEngine from "./pages/AgentEngine";

// 4. Deployment Layer
import DeploymentCenter from "./pages/DeploymentCenter";

// 5. Observability Layer
import ObservabilityDashboard from "./pages/ObservabilityDashboard";

// 6. Access & Identity Layer
import Auth from "./pages/Auth";
import OrgManagement from "./pages/OrgManagement";

// Legacy/Additional Pages
import VoiceAgents from "./pages/VoiceAgents";
import KnowledgeBuilder from "./pages/KnowledgeBuilder";
import AICopilot from "./pages/AICopilot";
import Docs from "./pages/Docs";

// Protected Route Component
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/docs" element={<Docs />} />
          
          {/* Protected System Routes */}
          <Route path="/studio" element={
            <ProtectedRoute>
              <Studio />
            </ProtectedRoute>
          } />
          
          <Route path="/store" element={
            <ProtectedRoute>
              <AgentStore />
            </ProtectedRoute>
          } />
          
          <Route path="/engine" element={
            <ProtectedRoute>
              <AgentEngine />
            </ProtectedRoute>
          } />
          
          <Route path="/deploy" element={
            <ProtectedRoute>
              <DeploymentCenter />
            </ProtectedRoute>
          } />
          
          <Route path="/observability" element={
            <ProtectedRoute>
              <ObservabilityDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/org" element={
            <ProtectedRoute>
              <OrgManagement />
            </ProtectedRoute>
          } />
          
          {/* Legacy Routes (for backward compatibility) */}
          <Route path="/voice-agents" element={
            <ProtectedRoute>
              <VoiceAgents />
            </ProtectedRoute>
          } />
          
          <Route path="/knowledge" element={
            <ProtectedRoute>
              <KnowledgeBuilder />
            </ProtectedRoute>
          } />
          
          <Route path="/copilot" element={
            <ProtectedRoute>
              <AICopilot />
            </ProtectedRoute>
          } />
          
          {/* Redirects for old routes */}
          <Route path="/core-platform" element={<Navigate to="/deploy" replace />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
