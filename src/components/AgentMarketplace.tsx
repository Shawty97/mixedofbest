
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentCard from './AgentCard';
import { toast } from "sonner";

const AgentMarketplace: React.FC = () => {
  const featuredAgents = [
    {
      name: "Sales Assistant",
      description: "AI agent trained to handle sales inquiries, qualify leads, and schedule demos.",
      type: "voice" as const,
      model: "ElevenLabs + GPT-4",
      tags: ["Sales", "Lead Gen", "Popular"]
    },
    {
      name: "Customer Support",
      description: "Provides 24/7 customer support with deep product knowledge and issue resolution.",
      type: "voice" as const,
      model: "ElevenLabs + Claude 3",
      tags: ["Support", "Troubleshooting"]
    },
    {
      name: "Content Writer",
      description: "Creates engaging blog posts, social media content, and marketing copy.",
      type: "chat" as const,
      model: "GPT-4",
      tags: ["Content", "Marketing"]
    },
    {
      name: "Product Advisor",
      description: "Helps customers find the right product based on their needs and preferences.",
      type: "voice" as const,
      model: "ElevenLabs + LLaMA 3",
      tags: ["Retail", "Recommendations"]
    },
    {
      name: "Legal Assistant",
      description: "Provides legal information and helps draft basic legal documents.",
      type: "chat" as const,
      model: "Claude 3 Opus",
      tags: ["Legal", "Documentation"]
    },
    {
      name: "Financial Advisor",
      description: "Offers financial advice, budget planning, and investment strategies.",
      type: "voice" as const,
      model: "ElevenLabs + GPT-4o",
      tags: ["Finance", "Planning", "Premium"]
    }
  ];

  const handleInstall = (agentName: string) => {
    toast.success(`${agentName} agent installed successfully`);
  };

  return (
    <Card className="border border-white/10 bg-secondary/25">
      <CardHeader>
        <CardTitle className="text-gradient text-2xl font-bold">Agent Marketplace</CardTitle>
        <CardDescription>
          Discover and install pre-built AI agents for various use cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="voice">Voice Agents</TabsTrigger>
            <TabsTrigger value="chat">Chat Agents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured" className="mt-0">
            <div className="agent-grid">
              {featuredAgents.map((agent, i) => (
                <AgentCard
                  key={i}
                  {...agent}
                  onClick={() => handleInstall(agent.name)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="voice" className="mt-0">
            <div className="agent-grid">
              {featuredAgents
                .filter(agent => agent.type === 'voice')
                .map((agent, i) => (
                  <AgentCard
                    key={i}
                    {...agent}
                    onClick={() => handleInstall(agent.name)}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="mt-0">
            <div className="agent-grid">
              {featuredAgents
                .filter(agent => agent.type === 'chat')
                .map((agent, i) => (
                  <AgentCard
                    key={i}
                    {...agent}
                    onClick={() => handleInstall(agent.name)}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Browse All</Button>
        <Button variant="ghost">Submit Agent</Button>
      </CardFooter>
    </Card>
  );
};

export default AgentMarketplace;
