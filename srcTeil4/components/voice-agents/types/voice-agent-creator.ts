
import { VoiceAgent, VoiceAgentCreationData } from '@/types/voice-agent.types';

export interface VoiceAgentCreatorProps {
  apiKey?: string;
  onCreateAgent: (agent: VoiceAgentCreationData) => Promise<VoiceAgent | null>;
}

export interface BasicSettingsProps {
  agentName: string;
  setAgentName: (name: string) => void;
  agentDescription: string;
  setAgentDescription: (description: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  selectedCapabilities: string[];
  setSelectedCapabilities: (capabilities: string[]) => void;
  handleGenerateWithAI: () => void;
}

export interface AdvancedSettingsProps {
  apiKeyInput: string;
  setApiKeyInput: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
}
