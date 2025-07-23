
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { AgentType } from "@/hooks/use-agent-store";
import { Label } from "@/components/ui/label";
import { ChevronRight, CombineIcon, Sparkles } from "lucide-react";

interface AgentCombinerProps {
  selectedAgents: AgentType[];
  onCombineAgents: (name: string, description: string) => void;
  onCancel: () => void;
}

export function AgentCombiner({ selectedAgents, onCombineAgents, onCancel }: AgentCombinerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNames = () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const suggestions = [
        "Marketing Analytics Expert",
        "Social Media Campaign Manager",
        "Content Strategy Specialist"
      ];
      
      setName(suggestions[0]);
      setDescription(`A powerful combined agent utilizing the strengths of ${selectedAgents.map(a => a.name).join(" and ")} to deliver comprehensive marketing solutions with analytical insights and creative content generation.`);
      
      setIsGenerating(false);
      toast({
        title: "Suggestions Generated",
        description: "AI has created name and description suggestions based on selected agents.",
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CombineIcon className="h-5 w-5 text-quantum-600" />
          Combine Selected Agents
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Agents:</p>
          <div className="space-y-2">
            {selectedAgents.map((agent) => (
              <div key={agent.id} className="flex items-center p-2 bg-muted rounded-md">
                <div className="flex-1">
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.categories.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGenerateNames}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Name & Description"}
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="combined-name">Combined Agent Name</Label>
            <Input 
              id="combined-name" 
              placeholder="Enter a name for your combined agent" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="combined-description">Description</Label>
            <Textarea 
              id="combined-description" 
              placeholder="Describe what your combined agent does" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 resize-none"
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={() => onCombineAgents(name, description)}
          disabled={!name.trim() || !description.trim()}
          className="flex items-center gap-2"
        >
          <CombineIcon className="h-4 w-4" />
          Create Combined Agent
        </Button>
      </CardFooter>
    </Card>
  );
}
