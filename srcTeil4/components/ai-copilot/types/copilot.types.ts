
export interface CopilotSession {
  id: string;
  user_id: string;
  session_type: 'workflow_help' | 'debugging' | 'optimization' | 'code_generation' | 'general';
  context: Record<string, any>;
  started_at: string;
  ended_at?: string;
  total_messages: number;
  total_tokens: number;
  session_cost: number;
}

export interface CopilotMessage {
  id: string;
  session_id: string;
  message_type: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  tokens_used: number;
  processing_time: number;
  model_used: string;
  created_at: string;
}

export interface CodeSuggestion {
  id: string;
  user_id: string;
  session_id: string;
  suggestion_type: 'optimization' | 'fix' | 'enhancement' | 'refactor' | 'security';
  context: Record<string, any>;
  suggestion_data: {
    type: string;
    content?: string;
    description: string;
    language?: string;
    recommendations?: string[];
    code_changes?: {
      file_path: string;
      old_code: string;
      new_code: string;
      line_numbers: number[];
    }[];
  };
  status: 'pending' | 'applied' | 'dismissed' | 'modified';
  confidence_score: number;
  created_at: string;
  applied_at?: string;
  user_feedback?: string;
}

export interface PerformanceMetric {
  category: 'speed' | 'cost' | 'reliability' | 'efficiency';
  name: string;
  current_value: number;
  optimal_value: number;
  unit: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  historical_data?: {
    timestamp: string;
    value: number;
  }[];
}

export interface OptimizationSuggestion {
  id: string;
  category: 'speed' | 'cost' | 'reliability' | 'efficiency';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimated_savings: {
    cost_percent?: number;
    time_percent?: number;
    reliability_percent?: number;
    efficiency_percent?: number;
  };
  implementation_steps: string[];
  priority_score: number;
  technical_details?: {
    code_changes?: string[];
    configuration_changes?: Record<string, any>;
    dependencies?: string[];
  };
}

export interface DebugSession {
  id: string;
  error_type: string;
  description: string;
  context: Record<string, any>;
  status: 'analyzing' | 'diagnosed' | 'resolved' | 'escalated';
  diagnosis?: string;
  solutions?: string[];
  created_at: Date;
  resolved_at?: Date;
  resolution_notes?: string;
}

export interface WorkflowContext {
  currentWorkflow?: {
    id: string;
    name: string;
    nodes: any[];
    edges: any[];
  };
  selectedNodes?: string[];
  workspaceData?: {
    totalWorkflows: number;
    activeWorkflow?: string;
    recentErrors?: any[];
    performanceMetrics?: PerformanceMetric[];
  };
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  cost_per_token: number;
  capabilities: string[];
  max_tokens: number;
  supports_streaming: boolean;
}

export interface CopilotConfig {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enableSuggestions: boolean;
  enableDebugMode: boolean;
  autoSaveConversations: boolean;
  retryAttempts: number;
  timeoutMs: number;
}

export interface CommandPaletteState {
  isOpen: boolean;
  currentInput: string;
  suggestions: string[];
  isProcessing: boolean;
  lastCommands: string[];
}

export interface CopilotAnalytics {
  totalSessions: number;
  totalCommands: number;
  totalTokensUsed: number;
  totalCost: number;
  averageSessionLength: number;
  mostUsedFeatures: string[];
  errorResolutionRate: number;
  optimizationAcceptanceRate: number;
  userSatisfactionScore?: number;
}

