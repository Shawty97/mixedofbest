
import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { VoiceAgentsListProps } from "./types/voice-agent-list";
import { VoiceAgentCard } from "./list/VoiceAgentCard";
import { VoiceAgentActions } from "./list/VoiceAgentActions";
import { VoiceAgentFilters } from "./list/VoiceAgentFilters";

export function VoiceAgentsList({ 
  agents, 
  isLoading,
  selectedAgentId,
  onSelectAgent,
  onDuplicateAgent,
  onDeleteAgent,
  onMergeAgents,
  onToggleActive
}: VoiceAgentsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAgentsForMerge, setSelectedAgentsForMerge] = useState<string[]>([]);
  const [isMergeMode, setIsMergeMode] = useState(false);
  
  const handlePlayDemo = (agentId: string) => {
    toast({
      title: "Playing Voice Demo",
      description: "Demonstrating the agent's voice and capabilities...",
    });
  };
  
  const handleAgentSelect = (agentId: string) => {
    if (isMergeMode) {
      // In merge mode, toggle selection for merge
      if (selectedAgentsForMerge.includes(agentId)) {
        setSelectedAgentsForMerge(prev => prev.filter(id => id !== agentId));
      } else {
        setSelectedAgentsForMerge(prev => [...prev, agentId]);
      }
    } else {
      // Normal mode, select agent for testing
      onSelectAgent(agentId);
      toast({
        title: "Agent Selected",
        description: "You can now test this agent in the Voice Test tab.",
      });
    }
  };

  const handleDuplicateAgent = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicateAgent) {
      onDuplicateAgent(agentId);
      toast({
        title: "Agent Duplicated",
        description: "A copy of the agent has been created.",
      });
    }
  };

  const handleDeleteAgent = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteAgent) {
      onDeleteAgent(agentId);
      toast({
        title: "Agent Deleted",
        description: "The agent has been removed.",
      });
    }
  };

  const handleToggleActive = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleActive) {
      onToggleActive(agentId);
    }
  };

  const handleMergeSelected = () => {
    if (selectedAgentsForMerge.length < 2) {
      toast({
        title: "Merge Error",
        description: "Please select at least 2 agents to merge.",
        variant: "destructive"
      });
      return;
    }

    if (onMergeAgents) {
      onMergeAgents(selectedAgentsForMerge);
      setSelectedAgentsForMerge([]);
      setIsMergeMode(false);
      toast({
        title: "Agents Merged",
        description: "A new agent has been created with combined capabilities.",
      });
    }
  };

  const handleCreateNewAgent = () => {
    toast({ 
      title: "Coming Soon", 
      description: "New agents will be available in the next update." 
    });
  };
  
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "active" && agent.isActive) || 
      (filterStatus === "inactive" && !agent.isActive);
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Voice Agents</h2>
        <VoiceAgentActions 
          isMergeMode={isMergeMode}
          selectedAgentsForMerge={selectedAgentsForMerge}
          onMergeSelected={handleMergeSelected}
          onCancelMerge={() => {
            setIsMergeMode(false);
            setSelectedAgentsForMerge([]);
          }}
          onStartMergeMode={() => setIsMergeMode(true)}
          onCreateNewAgent={handleCreateNewAgent}
        />
      </div>
      
      <VoiceAgentFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No agents match your search criteria</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredAgents.map(agent => (
              <VoiceAgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedAgentId === agent.id}
                isMergeMode={isMergeMode}
                isSelectedForMerge={selectedAgentsForMerge.includes(agent.id)}
                onSelect={handleAgentSelect}
                onDuplicate={handleDuplicateAgent}
                onDelete={handleDeleteAgent}
                onToggleActive={handleToggleActive}
                onPlayDemo={handlePlayDemo}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
