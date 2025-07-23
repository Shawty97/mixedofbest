
import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";
import { VoiceAgentActionsProps } from "../types/voice-agent-list";

export function VoiceAgentActions({
  isMergeMode,
  selectedAgentsForMerge,
  onMergeSelected,
  onCancelMerge,
  onStartMergeMode,
  onCreateNewAgent
}: VoiceAgentActionsProps) {
  return (
    <div className="flex gap-2">
      {isMergeMode ? (
        <>
          <Button 
            variant="default" 
            className="flex items-center gap-2" 
            onClick={onMergeSelected}
          >
            <Brain className="h-4 w-4" />
            Merge Selected ({selectedAgentsForMerge.length})
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancelMerge}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={onStartMergeMode}
          >
            <Brain className="h-4 w-4" />
            Merge Agents
          </Button>
          <Button 
            className="flex items-center gap-2" 
            onClick={onCreateNewAgent}
          >
            <Plus className="h-4 w-4" />
            New Voice Agent
          </Button>
        </>
      )}
    </div>
  );
}
