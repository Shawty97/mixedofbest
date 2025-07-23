
import { useState, useEffect } from 'react';
import { VoiceAgent, VoiceAgentCreationData } from '../types/voice-agent.types';
import { VoiceAgentsService } from '../services/voice-agents-service';
import {
  createVoiceAgent as createAgentLocal,
  duplicateVoiceAgent as duplicateAgentLocal,
  mergeVoiceAgents as mergeAgentsLocal
} from '../utils/voice-agent-operations';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './use-auth';

export function useVoiceAgents() {
  const [voiceAgents, setVoiceAgents] = useState<VoiceAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  
  // Load agents on initialization
  useEffect(() => {
    const initializeAgents = async () => {
      if (isInitialized) return;
      
      setIsLoading(true);
      try {
        const agents = await VoiceAgentsService.loadVoiceAgents();
        setVoiceAgents(agents);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to load voice agents:", error);
        toast({
          title: "Error Loading Voice Agents",
          description: "There was a problem loading your voice agents. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAgents();
  }, [isInitialized]);
  
  // Create a new voice agent
  const createVoiceAgent = async (agentData: VoiceAgentCreationData): Promise<VoiceAgent | null> => {
    try {
      const newAgent = await VoiceAgentsService.createVoiceAgent(agentData);
      
      if (newAgent) {
        setVoiceAgents(prev => [newAgent, ...prev]);
        toast({
          title: "Voice Agent Created",
          description: `${newAgent.name} has been created successfully.`,
        });
      }
      
      return newAgent;
    } catch (error) {
      console.error("Failed to create voice agent:", error);
      toast({
        title: "Error Creating Agent",
        description: "There was a problem creating the voice agent. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Update an existing voice agent
  const updateVoiceAgent = async (id: string, updates: Partial<VoiceAgent>) => {
    try {
      const success = await VoiceAgentsService.updateVoiceAgent(id, updates);
      
      if (success) {
        setVoiceAgents(prev => prev.map(agent => 
          agent.id === id ? { ...agent, ...updates } : agent
        ));
      }
      
      return success;
    } catch (error) {
      console.error("Failed to update voice agent:", error);
      toast({
        title: "Error Updating Agent",
        description: "There was a problem updating the voice agent. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Delete a voice agent
  const deleteVoiceAgent = async (id: string) => {
    try {
      const success = await VoiceAgentsService.deleteVoiceAgent(id);
      
      if (success) {
        setVoiceAgents(prev => prev.filter(agent => agent.id !== id));
        toast({
          title: "Agent Deleted",
          description: "The voice agent has been deleted successfully.",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Failed to delete voice agent:", error);
      toast({
        title: "Error Deleting Agent",
        description: "There was a problem deleting the voice agent. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Toggle a voice agent's active status
  const toggleVoiceAgentActive = async (id: string) => {
    try {
      const success = await VoiceAgentsService.toggleVoiceAgentActive(id);
      
      if (success) {
        setVoiceAgents(prev => prev.map(agent => 
          agent.id === id ? { ...agent, isActive: !agent.isActive } : agent
        ));
      }
      
      return success;
    } catch (error) {
      console.error("Failed to toggle voice agent active state:", error);
      toast({
        title: "Error Updating Agent",
        description: "There was a problem updating the voice agent. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Get a specific voice agent
  const getVoiceAgent = (id: string) => {
    return voiceAgents.find(agent => agent.id === id) || null;
  };
  
  // Duplicate a voice agent
  const duplicateVoiceAgent = async (id: string) => {
    try {
      const duplicate = await VoiceAgentsService.duplicateVoiceAgent(id);
      
      if (duplicate) {
        setVoiceAgents(prev => [duplicate, ...prev]);
        toast({
          title: "Agent Duplicated",
          description: "A copy of the agent has been created.",
        });
      }
      
      return duplicate;
    } catch (error) {
      console.error("Failed to duplicate voice agent:", error);
      toast({
        title: "Error Duplicating Agent",
        description: "There was a problem duplicating the voice agent. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Merge multiple voice agents
  const mergeVoiceAgents = async (ids: string[]) => {
    try {
      // Use local merge logic then save to Supabase
      const mergedAgent = mergeAgentsLocal(voiceAgents, ids);
      if (!mergedAgent) return null;
      
      const savedAgent = await VoiceAgentsService.createVoiceAgent({
        name: mergedAgent.name,
        description: mergedAgent.description,
        voiceId: mergedAgent.voiceId,
        modelId: mergedAgent.modelId,
        voiceName: mergedAgent.voiceName,
        modelName: mergedAgent.modelName,
        systemPrompt: mergedAgent.systemPrompt,
        capabilities: mergedAgent.capabilities,
        isActive: mergedAgent.isActive,
        learningMode: mergedAgent.learningMode,
        contextWindow: mergedAgent.contextWindow,
        maxResponseTokens: mergedAgent.maxResponseTokens,
        multimodalInput: mergedAgent.multimodalInput,
        temperatureValue: mergedAgent.temperatureValue,
        conversationMemory: mergedAgent.conversationMemory,
        knowledgeBases: mergedAgent.knowledgeBases,
        integrations: mergedAgent.integrations
      });
      
      if (savedAgent) {
        setVoiceAgents(prev => [savedAgent, ...prev]);
        toast({
          title: "Agents Merged",
          description: "A new agent has been created with combined capabilities.",
        });
      }
      
      return savedAgent;
    } catch (error) {
      console.error("Failed to merge voice agents:", error);
      toast({
        title: "Error Merging Agents",
        description: "There was a problem merging the voice agents. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  return {
    voiceAgents,
    isLoading,
    createVoiceAgent,
    updateVoiceAgent,
    deleteVoiceAgent,
    toggleVoiceAgentActive,
    getVoiceAgent,
    duplicateVoiceAgent,
    mergeVoiceAgents
  };
}
