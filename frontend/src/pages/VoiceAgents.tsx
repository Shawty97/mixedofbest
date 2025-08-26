import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Phone, Settings, PlayCircle, MessageSquare, Bot, Loader2 } from 'lucide-react';
import VoiceChatInterface from '@/components/voice/VoiceChatInterface';
import { apiService, Agent } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

const VoiceAgents: React.FC = () => {
  const { toast } = useToast();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const agentList = await apiService.getAgents();
      setAgents(agentList);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: "Error",
        description: "Failed to load voice agents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                  Chatting with {agents.find(a => (a._id || a.agent_id) === activeAgent)?.name}
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
                agentName={agents.find(a => (a._id || a.agent_id) === activeAgent)?.name}
                voiceProfile={agents.find(a => (a._id || a.agent_id) === activeAgent)?.voice_provider || 'default'}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading voice agents...</span>
                </div>
              ) : agents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Voice Agents Found</h3>
                  <p className="text-muted-foreground mb-4">Create your first voice agent to get started</p>
                  <Button onClick={() => window.location.href = '/agent-studio'}>Create Agent</Button>
                </div>
              ) : (
                agents.map((agent) => (
                  <Card key={agent._id || agent.agent_id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        {agent.name}
                      </CardTitle>
                      <CardDescription>
                        {agent.description || 'Voice-enabled AI assistant'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{agent.type || 'Voice Agent'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            agent.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => setActiveAgent(agent._id || agent.agent_id)}
                        disabled={agent.status !== 'active'}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
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