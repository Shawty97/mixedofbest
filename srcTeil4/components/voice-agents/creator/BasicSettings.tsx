
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Wand } from "lucide-react";
import { VOICES, CAPABILITY_OPTIONS } from "../constants/voice-agent-options";
import { BasicSettingsProps } from "../types/voice-agent-creator";

export function BasicSettings({
  agentName,
  setAgentName,
  agentDescription,
  setAgentDescription,
  selectedVoice,
  setSelectedVoice,
  systemPrompt,
  setSystemPrompt,
  selectedCapabilities,
  setSelectedCapabilities,
  handleGenerateWithAI
}: BasicSettingsProps) {
  
  const toggleCapability = (capability: string) => {
    setSelectedCapabilities(
      selectedCapabilities.includes(capability)
        ? selectedCapabilities.filter(c => c !== capability)
        : [...selectedCapabilities, capability]
    );
  };
  
  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agent-name">Agent Name</Label>
          <Input 
            id="agent-name" 
            placeholder="My Voice Assistant" 
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} ({voice.accent})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="agent-description">Description</Label>
        <Textarea 
          id="agent-description" 
          placeholder="Describe what your agent does..." 
          value={agentDescription}
          onChange={(e) => setAgentDescription(e.target.value)}
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Capabilities</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {CAPABILITY_OPTIONS.map((capability) => (
            <Button
              key={capability}
              variant={selectedCapabilities.includes(capability) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCapability(capability)}
              className={selectedCapabilities.includes(capability) ? "bg-quantum-600" : ""}
            >
              {selectedCapabilities.includes(capability) && (
                <Check className="h-3 w-3 mr-1" />
              )}
              {capability}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="system-prompt">System Prompt</Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGenerateWithAI}
            className="flex items-center gap-1"
          >
            <Wand className="h-3 w-3" />
            <span>Enhance with AI</span>
          </Button>
        </div>
        <Textarea 
          id="system-prompt" 
          placeholder="Instructions for your voice agent..." 
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
