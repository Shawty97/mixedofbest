
import { supabase } from "@/integrations/supabase/client";
import { VoiceAgent, VoiceAgentCreationData } from "@/types/voice-agent.types";

export class VoiceAgentsService {
  // Load voice agents from Supabase
  static async loadVoiceAgents(): Promise<VoiceAgent[]> {
    try {
      // Use type assertion since voice_agents table isn't in auto-generated types yet
      const { data: agents, error } = await (supabase as any)
        .from('voice_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading voice agents:', error);
        // Return empty array if table doesn't exist yet
        if (error.code === '42P01') { // relation does not exist
          console.log('Voice agents table not found - returning empty array');
          return [];
        }
        throw error;
      }

      return agents?.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        voiceId: agent.voice_id,
        modelId: agent.model_id,
        voiceName: agent.voice_name,
        modelName: agent.model_name,
        systemPrompt: agent.system_prompt,
        isActive: agent.is_active,
        created: new Date(agent.created_at),
        lastUsed: agent.last_used ? new Date(agent.last_used) : undefined,
        capabilities: agent.capabilities || [],
        knowledgeBases: agent.knowledge_bases || [],
        integrations: agent.integrations || [],
        knowledgeSources: agent.knowledge_sources || [],
        customInstructions: agent.custom_instructions,
        learningMode: agent.learning_mode,
        contextWindow: agent.context_window,
        maxResponseTokens: agent.max_response_tokens,
        multimodalInput: agent.multimodal_input,
        temperatureValue: agent.temperature_value,
        conversationMemory: agent.conversation_memory,
        providerId: agent.provider_id,
        isDemo: agent.is_demo
      })) || [];
    } catch (error) {
      console.error('Failed to load voice agents:', error);
      return [];
    }
  }

  // Create a new voice agent
  static async createVoiceAgent(agentData: VoiceAgentCreationData): Promise<VoiceAgent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newAgent = {
        user_id: user.id,
        name: agentData.name,
        description: agentData.description,
        voice_id: agentData.voiceId,
        model_id: agentData.modelId,
        voice_name: agentData.voiceName,
        model_name: agentData.modelName,
        system_prompt: agentData.systemPrompt || agentData.customInstructions,
        is_active: agentData.isActive ?? true,
        capabilities: agentData.capabilities || [],
        knowledge_sources: agentData.knowledgeSources || [],
        provider_id: agentData.providerId,
        custom_instructions: agentData.customInstructions,
        learning_mode: agentData.learningMode ?? false,
        context_window: agentData.contextWindow ?? 8192,
        max_response_tokens: agentData.maxResponseTokens ?? 1024,
        multimodal_input: agentData.multimodalInput ?? false,
        temperature_value: agentData.temperatureValue ?? 0.7,
        conversation_memory: agentData.conversationMemory ?? true,
        knowledge_bases: agentData.knowledgeBases || [],
        integrations: agentData.integrations || [],
        is_demo: agentData.isDemo ?? false
      };

      const { data: agent, error } = await (supabase as any)
        .from('voice_agents')
        .insert([newAgent])
        .select()
        .single();

      if (error) {
        console.error('Error creating voice agent:', error);
        throw error;
      }

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        voiceId: agent.voice_id,
        modelId: agent.model_id,
        voiceName: agent.voice_name,
        modelName: agent.model_name,
        systemPrompt: agent.system_prompt,
        isActive: agent.is_active,
        created: new Date(agent.created_at),
        lastUsed: agent.last_used ? new Date(agent.last_used) : undefined,
        capabilities: agent.capabilities || [],
        knowledgeBases: agent.knowledge_bases || [],
        integrations: agent.integrations || [],
        knowledgeSources: agent.knowledge_sources || [],
        customInstructions: agent.custom_instructions,
        learningMode: agent.learning_mode,
        contextWindow: agent.context_window,
        maxResponseTokens: agent.max_response_tokens,
        multimodalInput: agent.multimodal_input,
        temperatureValue: agent.temperature_value,
        conversationMemory: agent.conversation_memory,
        providerId: agent.provider_id,
        isDemo: agent.is_demo
      };
    } catch (error) {
      console.error('Failed to create voice agent:', error);
      return null;
    }
  }

  // Update a voice agent
  static async updateVoiceAgent(id: string, updates: Partial<VoiceAgent>): Promise<boolean> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Map VoiceAgent properties to database columns
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.voiceId !== undefined) updateData.voice_id = updates.voiceId;
      if (updates.modelId !== undefined) updateData.model_id = updates.modelId;
      if (updates.voiceName !== undefined) updateData.voice_name = updates.voiceName;
      if (updates.modelName !== undefined) updateData.model_name = updates.modelName;
      if (updates.systemPrompt !== undefined) updateData.system_prompt = updates.systemPrompt;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.capabilities !== undefined) updateData.capabilities = updates.capabilities;
      if (updates.knowledgeSources !== undefined) updateData.knowledge_sources = updates.knowledgeSources;
      if (updates.providerId !== undefined) updateData.provider_id = updates.providerId;
      if (updates.customInstructions !== undefined) updateData.custom_instructions = updates.customInstructions;
      if (updates.learningMode !== undefined) updateData.learning_mode = updates.learningMode;
      if (updates.contextWindow !== undefined) updateData.context_window = updates.contextWindow;
      if (updates.maxResponseTokens !== undefined) updateData.max_response_tokens = updates.maxResponseTokens;
      if (updates.multimodalInput !== undefined) updateData.multimodal_input = updates.multimodalInput;
      if (updates.temperatureValue !== undefined) updateData.temperature_value = updates.temperatureValue;
      if (updates.conversationMemory !== undefined) updateData.conversation_memory = updates.conversationMemory;
      if (updates.knowledgeBases !== undefined) updateData.knowledge_bases = updates.knowledgeBases;
      if (updates.integrations !== undefined) updateData.integrations = updates.integrations;
      if (updates.isDemo !== undefined) updateData.is_demo = updates.isDemo;
      if (updates.lastUsed !== undefined) updateData.last_used = updates.lastUsed.toISOString();

      const { error } = await (supabase as any)
        .from('voice_agents')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating voice agent:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to update voice agent:', error);
      return false;
    }
  }

  // Delete a voice agent
  static async deleteVoiceAgent(id: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('voice_agents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting voice agent:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete voice agent:', error);
      return false;
    }
  }

  // Toggle voice agent active status
  static async toggleVoiceAgentActive(id: string): Promise<boolean> {
    try {
      // First get current status
      const { data: agent, error: fetchError } = await (supabase as any)
        .from('voice_agents')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Toggle the status
      const { error } = await (supabase as any)
        .from('voice_agents')
        .update({ 
          is_active: !agent.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error toggling voice agent active status:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to toggle voice agent active status:', error);
      return false;
    }
  }

  // Duplicate a voice agent
  static async duplicateVoiceAgent(id: string): Promise<VoiceAgent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the original agent
      const { data: originalAgent, error: fetchError } = await (supabase as any)
        .from('voice_agents')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate data
      const duplicateData = {
        ...originalAgent,
        id: undefined, // Let database generate new ID
        name: `${originalAgent.name} (Copy)`,
        user_id: user.id,
        created_at: undefined, // Let database set timestamp
        updated_at: undefined,
        last_used: null
      };

      const { data: duplicate, error } = await (supabase as any)
        .from('voice_agents')
        .insert([duplicateData])
        .select()
        .single();

      if (error) {
        console.error('Error duplicating voice agent:', error);
        throw error;
      }

      return {
        id: duplicate.id,
        name: duplicate.name,
        description: duplicate.description,
        voiceId: duplicate.voice_id,
        modelId: duplicate.model_id,
        voiceName: duplicate.voice_name,
        modelName: duplicate.model_name,
        systemPrompt: duplicate.system_prompt,
        isActive: duplicate.is_active,
        created: new Date(duplicate.created_at),
        lastUsed: duplicate.last_used ? new Date(duplicate.last_used) : undefined,
        capabilities: duplicate.capabilities || [],
        knowledgeBases: duplicate.knowledge_bases || [],
        integrations: duplicate.integrations || [],
        knowledgeSources: duplicate.knowledge_sources || [],
        customInstructions: duplicate.custom_instructions,
        learningMode: duplicate.learning_mode,
        contextWindow: duplicate.context_window,
        maxResponseTokens: duplicate.max_response_tokens,
        multimodalInput: duplicate.multimodal_input,
        temperatureValue: duplicate.temperature_value,
        conversationMemory: duplicate.conversation_memory,
        providerId: duplicate.provider_id,
        isDemo: duplicate.is_demo
      };
    } catch (error) {
      console.error('Failed to duplicate voice agent:', error);
      return null;
    }
  }

  // Call OpenAI via Supabase Edge Function
  static async callOpenAI(messages: any[], model = 'gpt-4o-mini', temperature = 0.7, maxTokens = 1000) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages,
          model,
          temperature,
          maxTokens
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error;
    }
  }

  // Generate TTS via ElevenLabs Edge Function
  static async generateTTS(text: string, voiceId: string, modelId = 'eleven_multilingual_v2') {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text,
          voiceId,
          modelId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating TTS:', error);
      throw error;
    }
  }
}
