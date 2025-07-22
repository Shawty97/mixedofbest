import { VoiceAgentWithStats } from '@/types/voice-agent.types';
import { api } from './api';

export interface VoiceAgentCreationParams {
  name: string;
  description?: string;
  avatar?: string;
  voice_id?: string;
  voice_settings?: Record<string, any>;
  system_prompt?: string;
}

export interface VoiceAgentUpdateParams {
  name?: string;
  description?: string;
  avatar?: string;
  voice_id?: string;
  voice_settings?: Record<string, any>;
  system_prompt?: string;
}

export interface VoiceAgentResponse {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  voice_id: string | null;
  voice_provider: string;
  voice_settings: Record<string, any>;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string | null;
  knowledge_base_ids: string[];
  vector_collection: string | null;
  avg_response_time: number;
  total_interactions: number;
  rating: number;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoiceInteractionParams {
  session_id: string;
  user_input: string;
  agent_response: string;
  user_audio_url?: string;
  agent_audio_url?: string;
  tokens_used?: number;
  response_time?: number;
  user_rating?: number;
}

export interface VoiceInteractionResponse {
  id: string;
  voice_agent_id: string;
  user_id: string;
  session_id: string;
  user_input: string;
  agent_response: string;
  user_audio_url: string | null;
  agent_audio_url: string | null;
  tokens_used: number;
  response_time: number;
  user_rating: number | null;
  created_at: string;
}

export interface VoiceAgentMetricsResponse {
  total_interactions: number;
  avg_response_time: number;
  avg_tokens_per_interaction: number;
  avg_user_rating: number;
  total_tokens_last_100: number;
}

class VoiceAgentsEnhancedService {
  // Create a new voice agent
  async createVoiceAgent(params: VoiceAgentCreationParams): Promise<VoiceAgentResponse> {
    try {
      const response = await api.post('/voice-agents/', params);
      return response.data;
    } catch (error) {
      console.error('Error creating voice agent:', error);
      throw error;
    }
  }

  // List all voice agents for the current user
  async listVoiceAgents(offset = 0, limit = 10): Promise<VoiceAgentResponse[]> {
    try {
      const response = await api.get(`/voice-agents/?offset=${offset}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error listing voice agents:', error);
      throw error;
    }
  }

  // Get a specific voice agent
  async getVoiceAgent(agentId: string): Promise<VoiceAgentResponse> {
    try {
      const response = await api.get(`/voice-agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting voice agent ${agentId}:`, error);
      throw error;
    }
  }

  // Update a voice agent
  async updateVoiceAgent(agentId: string, params: VoiceAgentUpdateParams): Promise<VoiceAgentResponse> {
    try {
      const response = await api.put(`/voice-agents/${agentId}`, params);
      return response.data;
    } catch (error) {
      console.error(`Error updating voice agent ${agentId}:`, error);
      throw error;
    }
  }

  // Delete a voice agent
  async deleteVoiceAgent(agentId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/voice-agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting voice agent ${agentId}:`, error);
      throw error;
    }
  }

  // Create a new interaction with a voice agent
  async createInteraction(
    agentId: string, 
    params: VoiceInteractionParams
  ): Promise<VoiceInteractionResponse> {
    try {
      const response = await api.post(`/voice-agents/${agentId}/interactions`, params);
      return response.data;
    } catch (error) {
      console.error(`Error creating interaction with agent ${agentId}:`, error);
      throw error;
    }
  }

  // List interactions for a voice agent
  async listInteractions(
    agentId: string, 
    offset = 0, 
    limit = 10
  ): Promise<VoiceInteractionResponse[]> {
    try {
      const response = await api.get(
        `/voice-agents/${agentId}/interactions?offset=${offset}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error listing interactions for agent ${agentId}:`, error);
      throw error;
    }
  }

  // Get metrics for a voice agent
  async getAgentMetrics(agentId: string): Promise<VoiceAgentMetricsResponse> {
    try {
      const response = await api.get(`/voice-agents/${agentId}/metrics`);
      return response.data;
    } catch (error) {
      console.error(`Error getting metrics for agent ${agentId}:`, error);
      throw error;
    }
  }

  // Convert backend response to frontend type
  mapToFrontendType(agent: VoiceAgentResponse): VoiceAgentWithStats {
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description || '',
      avatarUrl: agent.avatar || '/placeholder.svg',
      voiceId: agent.voice_id || '',
      voiceProvider: agent.voice_provider,
      model: agent.model,
      systemPrompt: agent.system_prompt || '',
      created: new Date(agent.created_at).toISOString(),
      stats: {
        totalInteractions: agent.total_interactions,
        avgResponseTime: agent.avg_response_time,
        rating: agent.rating,
      },
      isActive: agent.is_active,
      settings: {
        temperature: agent.temperature,
        maxTokens: agent.max_tokens,
        ...agent.voice_settings
      }
    };
  }
}

export const voiceAgentsEnhancedService = new VoiceAgentsEnhancedService();