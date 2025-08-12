import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Phone, Settings, PlayCircle, MessageSquare, Bot } from 'lucide-react';
import VoiceChatInterface from '@/components/voice/VoiceChatInterface';

const VoiceAgents: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'customer-support',
      name: 'Customer Support Agent',
      description: 'Handles customer inquiries and support requests',
      voiceProfile: 'customer_service'
    },
    {
      id: 'sales-assistant',
      name: 'Sales Assistant',
      description: 'Helps with product information and sales',
      voiceProfile: 'professional_female'
    },
    {
      id: 'technical-expert',
      name: 'Technical Expert',
      description: 'Provides technical support and guidance',
      voiceProfile: 'technical_expert'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Voice Agents</h1>
        <p className="text-muted-foreground">
          Voice-enabled AI assistants with natural conversation capabilities
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Voice Chat</TabsTrigger>
          <TabsTrigger value="builder">Agent Builder</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="space-y-6">
          {activeAgent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Chatting with {agents.find(a => a.id === activeAgent)?.name}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveAgent(null)}
                >
                  Back to Agents
                </Button>
              </div>
              <VoiceChatInterface
                agentId={activeAgent}
                agentName={agents.find(a => a.id === activeAgent)?.name}
                voiceProfile={agents.find(a => a.id === activeAgent)?.voiceProfile}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      {agent.name}
                    </CardTitle>
                    <CardDescription>
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveAgent(agent.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Builder
                </CardTitle>
                <CardDescription>
                  Create custom voice-enabled agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Create Agent</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Integration
                </CardTitle>
                <CardDescription>
                  Connect agents to phone systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Setup Integration</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Voice Testing
                </CardTitle>
                <CardDescription>
                  Test voice interactions and quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Run Tests</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voice Settings
              </CardTitle>
              <CardDescription>
                Configure voice synthesis and recognition settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">TTS Providers</h4>
                  <p className="text-sm text-muted-foreground">
                    Azure Speech (Primary) → ElevenLabs (Fallback)
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">STT Provider</h4>
                  <p className="text-sm text-muted-foreground">
                    Azure Speech Services
                  </p>
                </div>
              </div>
              <Button variant="outline">Configure API Keys</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceAgents;