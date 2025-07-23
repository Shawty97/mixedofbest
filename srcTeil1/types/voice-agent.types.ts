
export interface VoiceAgent {
  id: string;
  name: string;
  description: string;
  voiceId: string;
  modelId: string;
  created: Date;
  lastUsed?: Date;
  isActive?: boolean;
  customInstructions?: string;
  capabilities: string[];
  knowledgeSources?: string[];
  providerId?: string;
  // Add missing properties that are used in the codebase
  voiceName?: string;
  modelName?: string;
  systemPrompt?: string;
  learningMode?: boolean;
  contextWindow?: number;
  maxResponseTokens?: number;
  multimodalInput?: boolean;
  temperatureValue?: number;
  conversationMemory?: boolean;
  knowledgeBases?: string[];
  integrations?: string[];
  isDemo?: boolean; // Added isDemo property to match usage in code
}

export interface VoiceAgentCreationData {
  name: string;
  description: string;
  voiceId: string;
  modelId: string;
  customInstructions?: string;
  capabilities: string[];
  knowledgeSources?: string[];
  providerId?: string;
  apiKeyInput?: string;
  // Add missing properties that are used during creation
  voiceName?: string;
  modelName?: string;
  systemPrompt?: string;
  learningMode?: boolean;
  contextWindow?: number;
  maxResponseTokens?: number;
  multimodalInput?: boolean;
  temperatureValue?: number;
  conversationMemory?: boolean;
  knowledgeBases?: string[];
  integrations?: string[];
  isActive?: boolean;
  isDemo?: boolean; // Added isDemo property to match usage in code
}
