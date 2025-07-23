
export interface AgentTeam {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  team_config: {
    hierarchy: 'flat' | 'hierarchical' | 'democratic';
    communication_rules: string[];
    coordination_strategy: 'parallel' | 'sequential' | 'conditional';
  };
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  agent_workflow_id: string;
  role: 'manager' | 'worker' | 'coordinator';
  priority: number;
  config: {
    specialization?: string;
    capabilities?: string[];
    constraints?: string[];
  };
  workflow?: any; // Reference to workflow
}

export interface AgentCommunication {
  id: string;
  team_id: string;
  from_agent_id: string;
  to_agent_id: string;
  message_type: 'task' | 'result' | 'error' | 'coordination';
  content: any;
  status: 'pending' | 'delivered' | 'processed';
  created_at: string;
}

export interface TeamExecution {
  id: string;
  team_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_data: any;
  results?: any;
  performance_metrics?: {
    total_agents: number;
    successful_agents: number;
    execution_time: number;
    coordination_efficiency?: number;
  };
  started_at: string;
  completed_at?: string;
}

export interface MultiAgentWorkspace {
  teams: AgentTeam[];
  communications: AgentCommunication[];
  activeExecutions: TeamExecution[];
  performanceMetrics: {
    teamEfficiency: number;
    communicationLatency: number;
    conflictResolutionRate: number;
  };
}
