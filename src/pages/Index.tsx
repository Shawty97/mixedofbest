
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from '@/components/Navbar';
import VoiceAgentCreator from '@/components/VoiceAgentCreator';
import AgentMarketplace from '@/components/AgentMarketplace';
import AgentCard from '@/components/AgentCard';
import ApiKeyModal from '@/components/ApiKeyModal';
import useElevenLabs from '@/hooks/useElevenLabs';

const Index = () => {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [myAgents, setMyAgents] = useState<any[]>([]);
  const { hasApiKey, saveApiKey } = useElevenLabs();

  // Check for API key on initial load
  useEffect(() => {
    const apiKeyCheck = setTimeout(() => {
      if (!hasApiKey) {
        setShowApiKeyModal(true);
      }
    }, 1500);
    
    return () => clearTimeout(apiKeyCheck);
  }, [hasApiKey]);

  const handleAgentCreated = (newAgent: any) => {
    setMyAgents(prev => [newAgent, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-glow blur-2xl opacity-10 rounded-3xl"></div>
          <Card className="border border-white/10 bg-secondary/25 relative z-10">
            <CardHeader className="pb-2">
              <CardTitle className="text-4xl font-bold tracking-tight">
                <span className="text-gradient">AImpact Platform</span>
              </CardTitle>
              <CardDescription className="text-lg">
                Create, deploy and manage advanced AI agents with human-like voice capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-gradient-to-r from-ai-purple to-ai-blue hover:opacity-90"
                  size="lg"
                  onClick={() => toast.info("Welcome to AImpact! This is a demo of our voice agent creation platform.")}
                >
                  Get Started
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="col-span-1 lg:col-span-2">
            <Card className="border border-white/10 bg-secondary/25 h-full">
              <CardHeader>
                <CardTitle className="text-xl">Platform Overview</CardTitle>
                <CardDescription>
                  All-in-one AI agent ecosystem with voice, chat, and multimodal capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { title: "Agent Creator", value: "Build custom AI agents" },
                    { title: "Voice Integration", value: "Human-like voices" },
                    { title: "Marketplace", value: "Pre-built agents" },
                    { title: "Multiple LLMs", value: "Connect various models" },
                    { title: "Analytics", value: "Performance tracking" },
                    { title: "Knowledge Base", value: "Auto-builder" }
                  ].map((stat, i) => (
                    <Card key={i} className="bg-secondary/50">
                      <CardHeader className="py-2">
                        <p className="text-muted-foreground text-xs">{stat.title}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="font-semibold">{stat.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border border-white/10 bg-secondary/25 h-full">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="secondary">
                  Create New Agent
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                  Browse Marketplace
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                  Connect API Keys
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                  Import Knowledge
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="create" className="mb-8">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px] mb-8">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="my-agents">My Agents</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <VoiceAgentCreator onAgentCreated={handleAgentCreated} />
              
              <Card className="border border-white/10 bg-secondary/25">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="bg-ai-purple/20 text-ai-purple h-8 w-8 rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Create Your Agent</h3>
                        <p className="text-muted-foreground text-sm">
                          Define your agent's name, personality, and capabilities.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="bg-ai-blue/20 text-ai-blue h-8 w-8 rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Connect Voice</h3>
                        <p className="text-muted-foreground text-sm">
                          Choose from premium ElevenLabs voices for human-like interactions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="bg-ai-pink/20 text-ai-pink h-8 w-8 rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Deploy & Share</h3>
                        <p className="text-muted-foreground text-sm">
                          Deploy your agent with one click and share with your team or customers.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="my-agents" className="mt-0">
            {myAgents.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No agents created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI agent to get started
                </p>
                <Button>Create Agent</Button>
              </div>
            ) : (
              <div className="agent-grid">
                {myAgents.map((agent, i) => (
                  <AgentCard
                    key={i}
                    name={agent.name}
                    description={agent.description}
                    type={agent.type}
                    model={agent.model}
                    tags={agent.tags || []}
                    onClick={() => toast.info(`${agent.name} is ready to talk`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="marketplace" className="mt-0">
            <AgentMarketplace />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t border-white/10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-ai-purple to-ai-blue"></div>
            <span className="text-sm font-medium">AImpact Platform</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            &copy; 2025 AImpact Technologies. All rights reserved.
          </div>
          
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">Terms</Button>
            <Button variant="ghost" size="sm">Privacy</Button>
            <Button variant="ghost" size="sm">Contact</Button>
          </div>
        </div>
      </footer>
      
      <ApiKeyModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onSave={(key) => {
          saveApiKey(key);
          toast.success("ElevenLabs API key saved successfully");
        }}
      />
    </div>
  );
};

export default Index;
