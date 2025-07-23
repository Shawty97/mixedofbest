
import { VoiceAgent } from "@/types/voice-agent.types";

export interface VoiceAgentsListProps {
  agents: VoiceAgent[];
  isLoading: boolean;
  selectedAgentId?: string | null;
  onSelectAgent: (agentId: string) => void;
  onDuplicateAgent?: (agentId: string) => void;
  onDeleteAgent?: (agentId: string) => void;
  onMergeAgents?: (agentIds: string[]) => void;
  onToggleActive?: (agentId: string) => void;
}

export interface VoiceAgentCardProps {
  agent: VoiceAgent;
  isSelected: boolean;
  isMergeMode: boolean;
  isSelectedForMerge: boolean;
  onSelect: (agentId: string) => void;
  onDuplicate: (agentId: string, e: React.MouseEvent) => void;
  onDelete: (agentId: string, e: React.MouseEvent) => void;
  onToggleActive: (agentId: string, e: React.MouseEvent) => void;
  onPlayDemo: (agentId: string) => void;
}

export interface VoiceAgentActionsProps {
  isMergeMode: boolean;
  selectedAgentsForMerge: string[];
  onMergeSelected: () => void;
  onCancelMerge: () => void;
  onStartMergeMode: () => void;
  onCreateNewAgent: () => void;
}

export interface VoiceAgentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}
