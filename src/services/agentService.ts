import { supabase } from '@/integrations/supabase/client';

interface Agent {
  id?: string;
  name: string;
  description?: string;
  instructions?: string;
  voice_provider: 'elevenlabs' | 'openai' | 'azure';
  voice_id?: string;
  stt_provider: 'openai' | 'deepgram' | 'azure';
  tts_provider: 'elevenlabs' | 'openai' | 'azure';
  capabilities: string[];
  webhook_url?: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

interface CallAgentParams {
  agent_id: string;
  phone_number?: string;
  metadata?: Record<string, any>;
}

export const agentAPI = {
  // Create new agent
  create: async (agent: Omit<Agent, 'id'>) => {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's agents
  getAll: async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get agent by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update agent
  update: async (id: string, updates: Partial<Agent>) => {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete agent
  delete: async (id: string) => {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Call agent
  call: async ({ agent_id, phone_number, metadata }: CallAgentParams) => {
    const { data, error } = await supabase.functions.invoke('agent-call', {
      body: { agent_id, phone_number, metadata }
    });
    
    if (error) throw error;
    return data;
  },

  // Get agent calls
  getCalls: async (agentId?: string) => {
    let query = supabase
      .from('agent_calls')
      .select(`
        *,
        agents(name)
      `)
      .order('started_at', { ascending: false });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};