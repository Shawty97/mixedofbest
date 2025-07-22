
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Mic, Volume2, Check, Copy, Settings, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VoiceAgentCardProps } from "../types/voice-agent-list";

export function VoiceAgentCard({
  agent,
  isSelected,
  isMergeMode,
  isSelectedForMerge,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleActive,
  onPlayDemo
}: VoiceAgentCardProps) {
  return (
    <Card 
      key={agent.id} 
      className={`transition-all cursor-pointer hover:shadow-md ${
        agent.isActive ? "border-quantum-200" : "border-gray-200 opacity-75"
      } ${
        isSelected ? "ring-2 ring-quantum-500" : ""
      } ${
        isSelectedForMerge ? "ring-2 ring-amber-500" : ""
      }`}
      onClick={() => onSelect(agent.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Brain className={`h-5 w-5 ${agent.isActive ? "text-quantum-600" : "text-gray-400"}`} />
            {agent.name}
          </CardTitle>
          <Badge 
            variant={agent.isActive ? "default" : "outline"}
            className="cursor-pointer"
            onClick={(e) => onToggleActive(agent.id, e)}
          >
            {agent.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-gray-500 block text-xs">Voice</span>
            <span className="font-medium flex items-center gap-1">
              <Mic className="h-3 w-3" />
              {agent.voiceName}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Model</span>
            <span className="font-medium">{agent.modelName}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.map((capability, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {capability}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 flex-1"
            onClick={(e) => { e.stopPropagation(); onPlayDemo(agent.id); }}
          >
            <Volume2 className="h-3 w-3" />
            Demo
          </Button>
          
          {isMergeMode ? (
            <Button 
              variant={isSelectedForMerge ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1 flex-1"
            >
              {isSelectedForMerge ? (
                <>
                  <Check className="h-3 w-3" />
                  Selected
                </>
              ) : (
                "Select for merge"
              )}
            </Button>
          ) : (
            <Button 
              variant={isSelected ? "secondary" : "default"}
              size="sm"
              className="flex items-center gap-1 flex-1"
            >
              {isSelected ? (
                <>
                  <Check className="h-3 w-3" />
                  Selected
                </>
              ) : (
                "Select"
              )}
            </Button>
          )}
          
          <div className="flex">
            <Button 
              variant="ghost" 
              size="sm"
              className="px-2"
              onClick={(e) => onDuplicate(agent.id, e)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="px-2"
              onClick={(e) => onDelete(agent.id, e)}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="px-2"
              onClick={(e) => { 
                e.stopPropagation();
                toast({ 
                  title: "Settings", 
                  description: "Agent settings will be available soon." 
                }); 
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
