
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, X, Check, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AgentSchema, AgentVertical } from "@/types/agent.types";
import { toast } from "@/hooks/use-toast";

interface AgentRoleDefinitionProps {
  initialData?: Partial<AgentSchema>;
  verticals: AgentVertical[];
  onSave: (roleData: Partial<AgentSchema>) => void;
}

export function AgentRoleDefinition({ initialData, verticals, onSave }: AgentRoleDefinitionProps) {
  const [roleName, setRoleName] = useState(initialData?.name || '');
  const [roleDescription, setRoleDescription] = useState(initialData?.description || '');
  const [selectedVerticals, setSelectedVerticals] = useState<AgentVertical[]>(
    initialData?.verticals || []
  );
  const [newCapability, setNewCapability] = useState('');
  const [capabilities, setCapabilities] = useState(
    initialData?.capabilities || []
  );

  const handleAddCapability = () => {
    if (!newCapability.trim()) return;
    
    setCapabilities([
      ...capabilities,
      {
        id: `cap-${Date.now()}`,
        name: newCapability,
        description: `Capability to ${newCapability.toLowerCase()}`,
        category: 'general'
      }
    ]);
    
    setNewCapability('');
  };

  const handleRemoveCapability = (id: string) => {
    setCapabilities(capabilities.filter(cap => cap.id !== id));
  };

  const handleToggleVertical = (vertical: AgentVertical) => {
    if (selectedVerticals.includes(vertical)) {
      setSelectedVerticals(selectedVerticals.filter(v => v !== vertical));
    } else {
      setSelectedVerticals([...selectedVerticals, vertical]);
    }
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      toast({
        title: "Role name required",
        description: "Please provide a name for this agent role.",
        variant: "destructive"
      });
      return;
    }

    if (selectedVerticals.length === 0) {
      toast({
        title: "Select at least one vertical",
        description: "Please select at least one business vertical for this agent.",
        variant: "destructive"
      });
      return;
    }

    const roleData: Partial<AgentSchema> = {
      name: roleName,
      description: roleDescription,
      verticals: selectedVerticals,
      capabilities: capabilities,
    };

    onSave(roleData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-quantum-600" />
          Define Agent Role
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role-name">Role Name</Label>
          <Input
            id="role-name"
            placeholder="e.g. Sales Development Expert"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role-description">Role Description</Label>
          <Textarea
            id="role-description"
            placeholder="Describe what this agent role specializes in..."
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
            className="min-h-20"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Business Verticals</Label>
          <div className="flex flex-wrap gap-2">
            {verticals.map((vertical) => (
              <Badge 
                key={vertical}
                variant={selectedVerticals.includes(vertical) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleToggleVertical(vertical)}
              >
                {vertical.charAt(0).toUpperCase() + vertical.slice(1).replace('-', ' ')}
                {selectedVerticals.includes(vertical) ? 
                  <Check className="ml-1 h-3 w-3" /> : 
                  <Plus className="ml-1 h-3 w-3" />
                }
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Core Capabilities</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a capability"
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCapability();
                }
              }}
            />
            <Button variant="outline" onClick={handleAddCapability}>Add</Button>
          </div>
          
          <div className="mt-2 space-y-2">
            {capabilities.map((capability) => (
              <div 
                key={capability.id} 
                className="flex items-center justify-between bg-muted p-2 rounded-md"
              >
                <span>{capability.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveCapability(capability.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} className="bg-quantum-600 hover:bg-quantum-700">
            Save Role Definition
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
