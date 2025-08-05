import { supabase } from '@/integrations/supabase/client';
import { UniversalAgentDefinition, UniversalAgentManager } from '@/schemas/universalAgent';

export interface StoredUniversalAgent {
  id: string;
  definition: UniversalAgentDefinition;
  status: 'draft' | 'published' | 'archived';
  user_id: string;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}

export class UniversalAgentService {
  
  // Create a new universal agent
  static async create(definition: UniversalAgentDefinition, workspaceId?: string): Promise<StoredUniversalAgent> {
    // Validate the definition
    const validation = UniversalAgentManager.validateDefinition(definition);
    if (!validation.valid) {
      throw new Error(`Invalid agent definition: ${validation.errors?.join(', ')}`);
    }
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');
    
    const agentData = {
      definition,
      status: 'draft' as const,
      user_id: user.user.id,
      workspace_id: workspaceId
    };
    
    const { data, error } = await supabase
      .from('universal_agents')
      .insert(agentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Get all universal agents for the current user
  static async getAll(workspaceId?: string): Promise<StoredUniversalAgent[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');
    
    let query = supabase
      .from('universal_agents')
      .select('*')
      .eq('user_id', user.user.id)
      .order('updated_at', { ascending: false });
    
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  
  // Get a specific universal agent
  static async getById(id: string): Promise<StoredUniversalAgent | null> {
    const { data, error } = await supabase
      .from('universal_agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }
  
  // Update a universal agent
  static async update(id: string, updates: Partial<UniversalAgentDefinition>): Promise<StoredUniversalAgent> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Agent not found');
    
    const updatedDefinition = { ...existing.definition, ...updates };
    updatedDefinition.metadata.updated_at = new Date().toISOString();
    
    // Validate the updated definition
    const validation = UniversalAgentManager.validateDefinition(updatedDefinition);
    if (!validation.valid) {
      throw new Error(`Invalid agent definition: ${validation.errors?.join(', ')}`);
    }
    
    const { data, error } = await supabase
      .from('universal_agents')
      .update({ definition: updatedDefinition })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Delete a universal agent
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('universal_agents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
  
  // Publish an agent (make it available for deployment)
  static async publish(id: string): Promise<StoredUniversalAgent> {
    const { data, error } = await supabase
      .from('universal_agents')
      .update({ status: 'published' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Deploy an agent to a specific environment
  static async deploy(id: string, environment: 'development' | 'staging' | 'production'): Promise<{
    deployment_id: string;
    endpoint: string;
    status: string;
  }> {
    const agent = await this.getById(id);
    if (!agent) throw new Error('Agent not found');
    
    // Call the deployment edge function
    const { data, error } = await supabase.functions.invoke('deploy-universal-agent', {
      body: {
        agent_id: id,
        definition: agent.definition,
        environment
      }
    });
    
    if (error) throw error;
    return data;
  }
  
  // Import from YAML
  static async importFromYAML(yamlString: string, workspaceId?: string): Promise<StoredUniversalAgent> {
    try {
      const definition = UniversalAgentManager.fromYAML(yamlString);
      return await this.create(definition, workspaceId);
    } catch (error) {
      throw new Error(`Failed to import YAML: ${error}`);
    }
  }
  
  // Export to YAML
  static async exportToYAML(id: string): Promise<string> {
    const agent = await this.getById(id);
    if (!agent) throw new Error('Agent not found');
    
    return UniversalAgentManager.toYAML(agent.definition);
  }
  
  // Clone an existing agent
  static async clone(id: string, newName: string): Promise<StoredUniversalAgent> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Agent not found');
    
    const clonedDefinition = { ...existing.definition };
    clonedDefinition.id = `agent-${Date.now()}`;
    clonedDefinition.name = newName;
    clonedDefinition.metadata = {
      ...clonedDefinition.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version_history: []
    };
    
    return await this.create(clonedDefinition, existing.workspace_id);
  }
  
  // Search agents by criteria
  static async search(query: {
    category?: string;
    tags?: string[];
    capabilities?: string[];
    workspaceId?: string;
  }): Promise<StoredUniversalAgent[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');
    
    let dbQuery = supabase
      .from('universal_agents')
      .select('*')
      .eq('user_id', user.user.id);
    
    if (query.workspaceId) {
      dbQuery = dbQuery.eq('workspace_id', query.workspaceId);
    }
    
    const { data, error } = await dbQuery;
    if (error) throw error;
    
    // Filter by definition properties (would be more efficient with proper DB indexing)
    return (data || []).filter(agent => {
      if (query.category && agent.definition.category !== query.category) return false;
      
      if (query.tags && query.tags.length > 0) {
        const agentTags = agent.definition.metadata.tags || [];
        if (!query.tags.some(tag => agentTags.includes(tag))) return false;
      }
      
      if (query.capabilities && query.capabilities.length > 0) {
        const agentCapabilities = agent.definition.capabilities.map(c => c.id);
        if (!query.capabilities.some(cap => agentCapabilities.includes(cap))) return false;
      }
      
      return true;
    });
  }
  
  // Get marketplace agents (public agents from other users)
  static async getMarketplaceAgents(): Promise<StoredUniversalAgent[]> {
    const { data, error } = await supabase
      .from('universal_agents')
      .select(`
        *,
        profiles(display_name, avatar_url)
      `)
      .eq('status', 'published')
      .contains('definition->security', { access_level: 'public' })
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}