
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CorePlatform from "./pages/CorePlatform";
import Studio from "./pages/Studio";
import AgentStore from "./pages/AgentStore";
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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/landing" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/core-platform" element={<CorePlatform />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/agent-store" element={<AgentStore />} />
            <Route path="/knowledge-builder" element={<KnowledgeBuilder />} />
            <Route path="/voice-agents" element={<VoiceAgents />} />
            <Route path="/ai-copilot" element={<AICopilot />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
