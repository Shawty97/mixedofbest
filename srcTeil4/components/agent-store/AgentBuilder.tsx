
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, Sparkles, PenTool, Layers, Brain } from "lucide-react";
import { AgentSchema, AgentCapability } from "@/types/agent.types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface AgentBuilderProps {
  onAgentCreated: (agent: AgentSchema) => void;
}

export function AgentBuilder({ onAgentCreated }: AgentBuilderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedAgent, setGeneratedAgent] = useState<Partial<AgentSchema> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTab, setCurrentTab] = useState("prompt");
  
  const handleRecord = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Describe the agent you want to create...",
      });
      
      // Simulate recording timeout
      setTimeout(() => {
        setIsRecording(false);
        const demoPrompt = "Create a marketing specialist agent that can analyze social media trends, generate content ideas, and schedule posts across platforms.";
        setPrompt(demoPrompt);
        
        toast({
          title: "Recording Complete",
          description: "Your agent description has been captured.",
        });
      }, 3000);
    }
  };
  
  const generateAgentFromPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please describe the agent you want to create.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Generate a sample agent schema based on the prompt
      const mockCapabilities: AgentCapability[] = [
        {
          id: "social-analysis",
          name: "Social Media Analysis",
          description: "Analyzes social media trends and audience engagement",
          category: "analytics"
        },
        {
          id: "content-generation",
          name: "Content Generation",
          description: "Creates engaging posts and captions for various platforms",
          category: "content"
        },
        {
          id: "scheduling",
          name: "Post Scheduling",
          description: "Optimizes posting times and manages content calendar",
          category: "general"
        }
      ];
      
      const newAgent: Partial<AgentSchema> = {
        id: `agent-${Date.now()}`,
        name: "Marketing Specialist",
        description: "A specialized agent for social media marketing strategy, content creation, and campaign management.",
        version: "1.0.0",
        capabilities: mockCapabilities,
        tools: [
          {
            id: "trend-analyzer",
            name: "Trend Analyzer",
            description: "Identifies current trends in social media",
            isInternal: true
          },
          {
            id: "content-writer",
            name: "Content Writer",
            description: "Generates engaging social media content",
            isInternal: true
          }
        ],
        uiConfig: {
          displayMode: "chat"
        }
      };
      
      setGeneratedAgent(newAgent);
      setIsGenerating(false);
      setCurrentTab("review");
      
      toast({
        title: "Agent Generated",
        description: "Your agent blueprint is ready for review."
      });
    }, 2000);
  };
  
  const handleFinalizeAgent = () => {
    if (generatedAgent) {
      const finalAgent = generatedAgent as AgentSchema;
      onAgentCreated(finalAgent);
      
      toast({
        title: "Agent Created",
        description: "Your new agent has been added to the marketplace.",
      });
      
      // Reset form
      setPrompt("");
      setGeneratedAgent(null);
      setCurrentTab("prompt");
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-quantum-600" />
          Create New Agent
        </CardTitle>
      </CardHeader>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prompt">Natural Language Prompt</TabsTrigger>
          <TabsTrigger value="review">Review & Customize</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompt">
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="agent-prompt">Describe your agent</Label>
              <Textarea
                id="agent-prompt"
                placeholder="Describe the agent you want to create in natural language..."
                className="min-h-32 resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={isRecording ? "destructive" : "outline"} 
                size="sm"
                onClick={handleRecord}
                className="flex items-center gap-2"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop Recording" : "Voice Input"}
              </Button>
              
              <Button 
                variant="secondary" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  setPrompt("Create a marketing specialist agent that can analyze social media trends, generate content ideas, and schedule posts across platforms.");
                }}
              >
                <PenTool className="h-4 w-4" />
                Use Example
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              onClick={generateAgentFromPrompt}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Agent Blueprint"}
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="review">
          <CardContent className="space-y-4 pt-4">
            {generatedAgent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input 
                    id="agent-name" 
                    value={generatedAgent.name || ""} 
                    onChange={(e) => setGeneratedAgent({...generatedAgent, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea 
                    id="agent-description" 
                    value={generatedAgent.description || ""}
                    onChange={(e) => setGeneratedAgent({...generatedAgent, description: e.target.value})}
                    className="min-h-20 resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Capabilities</Label>
                  <div className="space-y-2">
                    {generatedAgent.capabilities?.map((capability, index) => (
                      <div key={index} className="flex items-center justify-between border p-2 rounded-md">
                        <div>
                          <p className="font-medium">{capability.name}</p>
                          <p className="text-sm text-muted-foreground">{capability.description}</p>
                        </div>
                        <Switch id={`capability-${index}`} defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>UI Configuration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={generatedAgent.uiConfig?.displayMode === "chat" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setGeneratedAgent({
                        ...generatedAgent,
                        uiConfig: {...(generatedAgent.uiConfig || {}), displayMode: "chat"}
                      })}
                    >
                      Chat Interface
                    </Button>
                    <Button 
                      variant={generatedAgent.uiConfig?.displayMode === "sidebar" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setGeneratedAgent({
                        ...generatedAgent,
                        uiConfig: {...(generatedAgent.uiConfig || {}), displayMode: "sidebar"}
                      })}
                    >
                      Sidebar Assistant
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No Agent Blueprint Generated</p>
                <p className="text-muted-foreground">Use the prompt tab to create your agent first</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleFinalizeAgent}
              disabled={!generatedAgent}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Create Agent
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
