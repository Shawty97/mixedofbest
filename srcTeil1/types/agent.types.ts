

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  category: 'data' | 'content' | 'code' | 'analytics' | 'communication' | 'general';
  icon?: string;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  apiEndpoint?: string;
  requiredParams?: string[];
  isInternal: boolean;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: AgentWorkflowStep[];
  triggerConditions?: AgentTriggerCondition[];
  outputFormat?: string;
}

export interface AgentWorkflowStep {
  id: string;
  name: string;
  toolId?: string;
  capability?: string;
  input: string | {
    source: 'previous-step' | 'user-input' | 'context';
    path?: string;
  };
  dependsOn?: string[];
}

export interface AgentTriggerCondition {
  type: 'schedule' | 'event' | 'manual';
  config: Record<string, any>;
}

export interface AgentSchema {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  tools: AgentTool[];
  workflows?: AgentWorkflow[];
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
  memoryConfig?: {
    contextWindow: number;
    persistenceLevel: 'session' | 'user' | 'global';
    knowledgeBase?: string[];
  };
  uiConfig?: {
    displayMode: 'sidebar' | 'chat' | 'panel' | 'fullscreen';
    theme?: Record<string, string>;
    customComponents?: string[];
  };
  // Self-improvement fields
  performanceMetrics?: {
    successRate?: number;
    userSatisfaction?: number;
    completionTime?: number;
    accuracy?: number;
    lastEvaluated?: Date;
  };
  learningConfig?: {
    selfImprovement: boolean;
    feedbackLoop: 'automatic' | 'manual' | 'hybrid';
    improvementStrategy: 'prompt-refinement' | 'parameter-tuning' | 'capability-expansion';
    learningRate?: number;
    adaptationThreshold?: number;
  };
  voiceConfig?: {
    enabled: boolean;
    voiceId?: string;
    language?: string;
    speechStyle?: 'casual' | 'professional' | 'empathetic';
    conversationalFormat?: boolean;
  };
  verticals: AgentVertical[];
}

export interface AgentBlueprint extends AgentSchema {
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  pricing: {
    model: 'free' | 'paid' | 'subscription';
    price?: number;
    currency?: string;
  };
  stats: {
    rating: number;
    reviews: number;
    downloads: number;
    lastUpdated: Date;
  };
  tags: string[];
  isVerified: boolean;
  isPublic: boolean;
  coverImage?: string;
  demoUrl?: string;
  verticals: AgentVertical[];
  // Feedback and improvement history
  feedbackHistory?: AgentFeedback[];
  improvementLog?: AgentImprovementEntry[];
}

// Self-improvement types
export interface AgentFeedback {
  id: string;
  userId: string;
  rating: number; // 1-5 scale
  comment?: string;
  taskId?: string;
  taskType?: string;
  createdAt: Date;
  metrics?: {
    accuracy?: number;
    speed?: number;
    relevance?: number;
    helpfulness?: number;
    [key: string]: number | undefined;
  };
}

export interface AgentImprovementEntry {
  id: string;
  timestamp: Date;
  changeType: 'prompt' | 'parameter' | 'capability' | 'tool' | 'workflow';
  description: string;
  previousValue?: any;
  newValue?: any;
  triggeredBy: 'system' | 'user' | 'self';
  performanceImpact?: number; // percentage change in performance
}

export type AgentVertical = 'marketing' | 'legal' | 'development' | 'design' | 'writing' | 'analytics' | 'finance' | 'education' | 'healthcare' | 'sales' | 'customer-support' | 'operations' | 'hr' | 'general';

export interface AgentCombination {
  id: string;
  name: string;
  parentAgents: string[];
  capabilities: AgentCapability[];
  workflow?: {
    steps: Array<{
      agentId: string;
      action: string;
    }>;
  };
}

// Define as string type for role to allow string comparisons
export type TeamMemberRole = 'owner' | 'admin' | 'member' | 'guest';

// User workspace and onboarding
export interface UserWorkspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  hiredAgents: string[]; // IDs of agents hired
  collections: AgentCollection[];
  settings: WorkspaceSettings;
  onboardingCompleted: boolean;
  onboardingStep?: number;
  team?: TeamMember[];
  agentLogs?: AgentSessionLog[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  permissions: {
    canCreateAgents: boolean;
    canHireAgents: boolean;
    canModifyWorkspace: boolean;
  };
}

export interface AgentSessionLog {
  id: string;
  agentId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  taskDescription?: string;
  inputs: AgentInteraction[];
  outputs: AgentInteraction[];
  performance?: {
    successRate?: number;
    completionTime?: number;
    userRating?: number;
  };
}

export interface AgentInteraction {
  timestamp: Date;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'action';
  metadata?: Record<string, any>;
}

export interface AgentCollection {
  id: string;
  name: string;
  description?: string;
  agentIds: string[];
  isDefault: boolean;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'system';
  defaultAgentDisplay: 'list' | 'grid' | 'detailed';
  notifications: boolean;
  autoImprovement: boolean;
  sessionContinuity?: boolean;
  defaultVoiceSettings?: {
    enabled: boolean;
    voiceId?: string;
  };
}
