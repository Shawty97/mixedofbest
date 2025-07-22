
import { VoiceAgent } from '../types/voice-agent.types';

// Create a new voice agent
export const createVoiceAgent = (
  currentAgents: VoiceAgent[],
  agentData: Omit<VoiceAgent, 'id' | 'created'>
): VoiceAgent => {
  const newAgent: VoiceAgent = {
    ...agentData,
    id: `agent-${Date.now()}`,
    created: new Date()
  };
  
  return newAgent;
};

// Update an existing voice agent
export const updateVoiceAgent = (
  agents: VoiceAgent[],
  id: string, 
  updates: Partial<VoiceAgent>
): VoiceAgent[] => {
  return agents.map(agent => 
    agent.id === id ? { ...agent, ...updates } : agent
  );
};

// Delete a voice agent
export const deleteVoiceAgent = (
  agents: VoiceAgent[],
  id: string
): VoiceAgent[] => {
  return agents.filter(agent => agent.id !== id);
};

// Toggle a voice agent's active status
export const toggleVoiceAgentActive = (
  agents: VoiceAgent[],
  id: string
): VoiceAgent[] => {
  return agents.map(agent => 
    agent.id === id ? { ...agent, isActive: !agent.isActive } : agent
  );
};

// Get a specific voice agent by ID
export const getVoiceAgent = (
  agents: VoiceAgent[],
  id: string
): VoiceAgent | null => {
  return agents.find(agent => agent.id === id) || null;
};

// Duplicate a voice agent
export const duplicateVoiceAgent = (
  agents: VoiceAgent[],
  id: string
): VoiceAgent | null => {
  const agent = getVoiceAgent(agents, id);
  if (!agent) return null;
  
  const duplicate: VoiceAgent = {
    ...agent,
    id: `agent-${Date.now()}`,
    name: `${agent.name} (Copy)`,
    created: new Date(),
    lastUsed: undefined
  };
  
  return duplicate;
};

// Merge multiple voice agents
export const mergeVoiceAgents = (
  agents: VoiceAgent[],
  ids: string[]
): VoiceAgent | null => {
  if (ids.length < 2) return null;
  
  const agentsToMerge = ids.map(id => getVoiceAgent(agents, id)).filter(Boolean) as VoiceAgent[];
  if (agentsToMerge.length < 2) return null;
  
  // Combine capabilities and knowledge from all agents
  const allCapabilities = Array.from(new Set(agentsToMerge.flatMap(a => a.capabilities)));
  const allKnowledgeBases = Array.from(new Set(agentsToMerge.flatMap(a => a.knowledgeBases || [])));
  const allIntegrations = Array.from(new Set(agentsToMerge.flatMap(a => a.integrations || [])));
  
  // Create a merged system prompt
  const combinedPrompt = `You are an advanced merged agent with combined capabilities. ${agentsToMerge.map(a => a.systemPrompt).join(' ')}`;
  
  // Create the merged agent
  const mergedAgent: VoiceAgent = {
    id: `merged-agent-${Date.now()}`,
    name: `Merged Agent (${agentsToMerge.map(a => a.name.split(' ')[0]).join(' + ')})`,
    description: `This agent combines capabilities from multiple specialized agents: ${agentsToMerge.map(a => a.name).join(', ')}`,
    voiceId: agentsToMerge[0].voiceId, // Take the first agent's voice
    modelId: agentsToMerge.find(a => a.modelId.includes('sts'))?.modelId || agentsToMerge[0].modelId, // Prefer STS model if available
    voiceName: agentsToMerge[0].voiceName,
    modelName: agentsToMerge.find(a => a.modelId.includes('sts'))?.modelName || agentsToMerge[0].modelName,
    systemPrompt: combinedPrompt,
    isActive: true,
    capabilities: allCapabilities,
    created: new Date(),
    learningMode: true,
    contextWindow: Math.max(...agentsToMerge.map(a => a.contextWindow || 8192)),
    maxResponseTokens: Math.max(...agentsToMerge.map(a => a.maxResponseTokens || 1024)),
    multimodalInput: agentsToMerge.some(a => a.multimodalInput),
    temperatureValue: agentsToMerge.reduce((sum, a) => sum + (a.temperatureValue || 0.7), 0) / agentsToMerge.length,
    conversationMemory: true,
    knowledgeBases: allKnowledgeBases.length > 0 ? allKnowledgeBases : undefined,
    integrations: allIntegrations.length > 0 ? allIntegrations : undefined
  };
  
  return mergedAgent;
};
