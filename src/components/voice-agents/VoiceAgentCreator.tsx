
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, Save, Volume2, Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VoiceAgentCreatorProps } from './types/voice-agent-creator';
import { BasicSettings } from './creator/BasicSettings';
import { AdvancedSettings } from './creator/AdvancedSettings';
import { VOICES, MODELS } from './constants/voice-agent-options';

export function VoiceAgentCreator({ apiKey, onCreateAgent }: VoiceAgentCreatorProps) {
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant. Be concise and friendly in your responses.");
  const [isListening, setIsListening] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || "");
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(["Customer Support"]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Find voice name for display
  const selectedVoiceObj = VOICES.find(v => v.id === selectedVoice);
  const selectedModelObj = MODELS.find(m => m.id === selectedModel);
  
  const handleToggleListen = () => {
    // For demonstration, we'll just toggle the state
    setIsListening(!isListening);
    
    if (!isListening) {
      toast({
        title: "Listening...",
        description: "Please speak your agent configuration.",
      });
      
      // Simulate speech recognition timeout
      setTimeout(() => {
        setIsListening(false);
        
        // Simulate speech-to-text result
        const demoName = "Customer Care Assistant";
        const demoDesc = "A helpful agent that assists customers with product inquiries and technical support.";
        
        setAgentName(demoName);
        setAgentDescription(demoDesc);
        
        toast({
          title: "Voice Input Processed",
          description: "Your agent configuration has been updated based on your voice input.",
        });
      }, 3000);
    }
  };
  
  const handleSaveAgent = () => {
    if (!agentName) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your voice agent.",
        variant: "destructive",
      });
      return;
    }
    
    // In demo mode, we don't require an API key
    const isDemo = !apiKey && !apiKeyInput;
    
    if (isDemo) {
      toast({
        title: "Demo Mode Active",
        description: "Creating agent in demo mode. Some features will be simulated.",
      });
    }
    
    setIsSaving(true);
    
    // Create new agent using our hook
    const newAgent = onCreateAgent({
      name: agentName,
      description: agentDescription,
      voiceId: selectedVoice,
      modelId: selectedModel,
      voiceName: selectedVoiceObj?.name + " (" + selectedVoiceObj?.accent + ")" || "Unknown",
      modelName: selectedModelObj?.name || "Unknown",
      systemPrompt: systemPrompt,
      capabilities: selectedCapabilities,
      apiKeyInput: apiKeyInput,
      isDemo: isDemo // Add flag to indicate demo mode
    });
    
    // Show success message
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Voice Agent Created",
        description: `${agentName} has been created successfully.`,
      });
      
      // Reset form
      setAgentName("");
      setAgentDescription("");
      setSystemPrompt("You are a helpful assistant. Be concise and friendly in your responses.");
      setSelectedCapabilities(["Customer Support"]);
    }, 1000);
  };
  
  const handleGenerateWithAI = () => {
    toast({
      title: "Generating with AI",
      description: "Using AI to enhance your voice agent configuration...",
    });
    
    // Simulate AI enhancement
    setTimeout(() => {
      setSystemPrompt(
        "You are a friendly and knowledgeable assistant with a warm, welcoming tone. " +
        "Answer questions concisely but thoroughly, and always look for ways to be helpful. " +
        "Make complex topics accessible and never be condescending. If you don't know something, " +
        "be honest about it rather than making up an answer. Always prioritize the customer's needs " +
        "and aim to resolve their queries in as few interactions as possible."
      );
      
      toast({
        title: "AI Enhancement Complete",
        description: "Your voice agent has been optimized with AI.",
      });
    }, 1500);
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-quantum-600" />
          Create Voice Agent {!apiKey && !apiKeyInput && "(Demo Mode)"}
        </CardTitle>
        <CardDescription>
          Design a human-like voice agent with advanced AI capabilities
          {!apiKey && !apiKeyInput && " - Demo mode is active, all features are simulated"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <BasicSettings 
              agentName={agentName}
              setAgentName={setAgentName}
              agentDescription={agentDescription}
              setAgentDescription={setAgentDescription}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
              selectedCapabilities={selectedCapabilities}
              setSelectedCapabilities={setSelectedCapabilities}
              handleGenerateWithAI={handleGenerateWithAI}
            />
          </TabsContent>
          
          <TabsContent value="advanced">
            <AdvancedSettings 
              apiKeyInput={apiKeyInput}
              setApiKeyInput={setApiKeyInput}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant={isListening ? "destructive" : "outline"}
          onClick={handleToggleListen}
          className="flex items-center gap-2"
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isListening ? "Stop Recording" : "Configure by Voice"}
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => {
              toast({
                title: "Voice Test",
                description: `Testing voice: ${selectedVoiceObj?.name || "Unknown"}`,
              });
            }}
          >
            <Volume2 className="h-4 w-4" />
            Test Voice
          </Button>
          
          <Button 
            onClick={handleSaveAgent}
            disabled={isSaving || !agentName}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Create Agent"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
