
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ApiKeyModal from "./ApiKeyModal";

interface VoiceAgentCreatorProps {
  onAgentCreated?: (agent: any) => void;
}

const VoiceAgentCreator: React.FC<VoiceAgentCreatorProps> = ({ onAgentCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [voice, setVoice] = useState("Aria");
  const [persona, setPersona] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const voices = [
    { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
    { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
    { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
    { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" }
  ];

  const handleCreate = () => {
    if (!name || !description || !voice || !persona) {
      toast.error("Please fill all fields");
      return;
    }

    setIsCreating(true);
    
    // This would normally connect to the ElevenLabs API
    // For now, we'll simulate the creation process
    setTimeout(() => {
      setIsCreating(false);
      toast.success(`Voice agent "${name}" created successfully`);
      
      if (onAgentCreated) {
        const newAgent = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          description,
          voice,
          persona,
          type: 'voice',
          model: 'ElevenLabs + GPT-4',
          tags: ['Custom', 'New'],
          createdAt: new Date().toISOString()
        };
        
        onAgentCreated(newAgent);
      }
      
      // Reset form
      setName("");
      setDescription("");
      setVoice("Aria");
      setPersona("");
    }, 1500);
  };

  return (
    <>
      <Card className="border border-white/10 bg-secondary/25">
        <CardHeader>
          <CardTitle className="text-gradient text-2xl font-bold">Create Voice Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input 
              id="agent-name" 
              placeholder="E.g. Customer Support Agent" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea 
              id="agent-description" 
              placeholder="What does this agent do?" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-voice">Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger id="agent-voice">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map(v => (
                  <SelectItem key={v.id} value={v.name}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Using ElevenLabs voices. 
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs" 
                onClick={() => setShowApiKeyModal(true)}
              >
                Configure API Key
              </Button>
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-persona">Agent Persona</Label>
            <Textarea 
              id="agent-persona" 
              placeholder="Describe the personality and behavior of this agent..." 
              value={persona} 
              onChange={(e) => setPersona(e.target.value)} 
              className="h-24"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCreate} 
            className="w-full bg-gradient-to-r from-ai-purple to-ai-blue hover:opacity-90"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Voice Agent"}
          </Button>
        </CardFooter>
      </Card>

      <ApiKeyModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onSave={(key) => {
          toast.success("ElevenLabs API key saved successfully");
          setShowApiKeyModal(false);
        }}
      />
    </>
  );
};

export default VoiceAgentCreator;
