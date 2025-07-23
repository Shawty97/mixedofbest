import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceAgentCreator } from "@/components/voice-agents/VoiceAgentCreator";
import { VoiceAgentsList } from "@/components/voice-agents/VoiceAgentsList";
import { VoiceConversation } from "@/components/voice-agents/VoiceConversation";
import { useVoiceAgents } from "@/hooks/use-voice-agents";
import { Brain, Sparkles, Mic, Settings, ArrowRight, Plus, ChevronsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VoiceAgent, VoiceAgentCreationData } from "@/types/voice-agent.types";
import { ApiKeyManager } from "@/components/voice-agents/ApiKeyManager";

const VoiceAgents = () => {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  
  const { 
    voiceAgents, 
    isLoading, 
    createVoiceAgent, 
    updateVoiceAgent, 
    deleteVoiceAgent, 
    toggleVoiceAgentActive, 
    duplicateVoiceAgent,
    mergeVoiceAgents
  } = useVoiceAgents();
  
  const selectedAgent = selectedAgentId 
    ? voiceAgents.find(agent => agent.id === selectedAgentId) 
    : null;

  // Check for local API keys
  useEffect(() => {
    const savedApiKey = localStorage.getItem("elevenlabs_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  
  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    localStorage.setItem("elevenlabs_api_key", key);
    toast({
      title: "API Key Saved",
      description: "Your ElevenLabs API key has been saved for this session.",
    });
  };
  
  const handleConversationStart = () => {
    if (selectedAgent) {
      updateVoiceAgent(selectedAgent.id, {
        lastUsed: new Date(),
      });
    }
  };

  // Handle the creation of voice agents, resolving the Promise
  const handleCreateAgent = async (agentData: VoiceAgentCreationData): Promise<VoiceAgent | null> => {
    try {
      const newAgent = await createVoiceAgent(agentData);
      
      if (newAgent) {
        setSelectedAgentId(newAgent.id);
        
        setTimeout(() => {
          toast({
            title: "Agent Created",
            description: "Your new agent is ready. Let's test it now!"
          });
          setActiveTab("test");
        }, 1500);
      }
      
      return newAgent;
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Error Creating Agent",
        description: "An error occurred while creating the agent",
        variant: "destructive"
      });
      return null;
    }
  };

  const hasLocalApiKeys = () => {
    return !!(
      localStorage.getItem("elevenlabs_api_key") ||
      localStorage.getItem("openai_api_key") ||
      localStorage.getItem("anthropic_api_key")
    );
  };
  
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Brain className="h-7 w-7 text-quantum-600" />
                Voice Agents
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create, manage, and deploy humanlike voice agents powered by advanced AI
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowApiKeyManager(true)}
              >
                <Settings className="h-4 w-4" />
                API Settings
              </Button>
            </div>
          </div>
          
          {hasLocalApiKeys() ? (
            <div className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-sm rounded-md p-2 mb-4">
              ✅ API Keys configured. Your voice agents are ready for real conversations!
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 text-sm rounded-md p-2 mb-4">
              ⚠️ Configure API keys for full functionality. Demo mode available without keys.
            </div>
          )}
          
          {selectedAgent && (
            <Card className="mb-4 border-quantum-200 bg-quantum-50/30 dark:bg-gray-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-quantum-100 text-quantum-800 border-quantum-300">
                      Selected Agent
                    </Badge>
                    <span className="font-medium">{selectedAgent.name}</span>
                    <span className="text-sm text-gray-500">
                      ({selectedAgent.capabilities.join(", ")})
                    </span>
                  </div>
                  
                  <Button 
                    size="sm"
                    variant="ghost"
                    className="flex items-center gap-1"
                    onClick={() => setActiveTab("test")}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Start Call</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Tabs defaultValue="marketplace" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="marketplace">Agent Marketplace</TabsTrigger>
            <TabsTrigger value="create">Create Agent</TabsTrigger>
            <TabsTrigger value="test">Voice Call</TabsTrigger>
          </TabsList>
          
          <TabsContent value="marketplace" className="space-y-6">
            <VoiceAgentsList 
              agents={voiceAgents} 
              isLoading={isLoading}
              onSelectAgent={setSelectedAgentId}
              selectedAgentId={selectedAgentId}
              onDuplicateAgent={duplicateVoiceAgent}
              onDeleteAgent={deleteVoiceAgent}
              onToggleActive={toggleVoiceAgentActive}
              onMergeAgents={mergeVoiceAgents}
            />
          </TabsContent>
          
          <TabsContent value="create">
            <VoiceAgentCreator 
              apiKey={apiKey}
              onCreateAgent={handleCreateAgent}
            />
          </TabsContent>
          
          <TabsContent value="test">
            <div className="max-w-2xl mx-auto">
              {selectedAgent ? (
                <VoiceConversation 
                  agentName={selectedAgent.name}
                  voiceId={selectedAgent.voiceId}
                  apiKey={apiKey}
                  systemPrompt={selectedAgent.systemPrompt || selectedAgent.customInstructions}
                  onConversationStart={handleConversationStart}
                />
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Select a voice agent from the marketplace to start a conversation
                    </p>
                    <Button onClick={() => setActiveTab("marketplace")}>
                      Go to Marketplace
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* API Key Manager Modal */}
        {showApiKeyManager && (
          <Dialog open={showApiKeyManager} onOpenChange={setShowApiKeyManager}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>API Configuration</DialogTitle>
                <DialogDescription>
                  Configure your AI service API keys for full functionality
                </DialogDescription>
              </DialogHeader>
              <ApiKeyManager />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageLayout>
  );
};

export default VoiceAgents;
