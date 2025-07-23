import { create } from 'zustand';
import { aiService, AIConversation, AIMessage } from '@/services/ai/aiService';
import { toast } from '@/hooks/use-toast';

export interface CommandResult {
  id: string;
  command: string;
  timestamp: number;
  response?: string;
  type: 'code' | 'ui' | 'workflow' | 'general';
  status: 'success' | 'error' | 'processing';
  metadata?: {
    tokensUsed?: number;
    cost?: number;
    processingTime?: number;
    model?: string;
  };
  actions?: Array<{
    type: string;
    data: any;
  }>;
}

export interface SuggestionType {
  command: string;
  type: 'code' | 'ui' | 'workflow' | 'general';
  confidence: number;
  description?: string;
}

interface EnhancedCopilotState {
  // Core state
  currentConversationId: string;
  conversations: Map<string, AIConversation>;
  suggestions: SuggestionType[];
  isProcessing: boolean;
  
  // AI Configuration
  aiConfig: {
    model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'claude-3-haiku';
    temperature: number;
    maxTokens: number;
  };
  
  // Context awareness
  workflowContext: {
    currentWorkflow?: any;
    selectedNodes?: string[];
    workspaceData?: any;
  };
  
  // Session management
  sessionStats: {
    totalCommands: number;
    totalTokens: number;
    totalCost: number;
    sessionStartTime: Date;
  };

  // Actions
  sendCommand: (command: string) => Promise<void>;
  createNewConversation: () => string;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  generateSuggestions: (input: string) => void;
  clearSuggestions: () => void;
  updateAIConfig: (config: Partial<EnhancedCopilotState['aiConfig']>) => void;
  updateWorkflowContext: (context: Partial<EnhancedCopilotState['workflowContext']>) => void;
  setApiKey: (provider: 'openai' | 'anthropic', apiKey: string) => void;
  loadConversations: () => void;
  exportConversation: (conversationId: string) => void;
  importConversation: (data: any) => void;
  clearAllData: () => void;
  getSessionStats: () => EnhancedCopilotState['sessionStats'];
  executeActions: (actions: Array<{ type: string; data: any }>) => Promise<void>;
}

export const useEnhancedCopilotStore = create<EnhancedCopilotState>((set, get) => ({
  // Initial state
  currentConversationId: '',
  conversations: new Map(),
  suggestions: [],
  isProcessing: false,
  
  aiConfig: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4000
  },
  
  workflowContext: {},
  
  sessionStats: {
    totalCommands: 0,
    totalTokens: 0,
    totalCost: 0,
    sessionStartTime: new Date()
  },

  // Actions
  sendCommand: async (command: string) => {
    const state = get();
    set({ isProcessing: true, suggestions: [] });
    
    try {
      // Create conversation if needed
      let conversationId = state.currentConversationId;
      if (!conversationId) {
        conversationId = get().createNewConversation();
      }

      // Process command through AI service
      const result = await aiService.processCommand(command, state.workflowContext);
      
      // Update conversation in our store
      const conversation = aiService.getConversation(conversationId);
      if (conversation) {
        const updatedConversations = new Map(state.conversations);
        updatedConversations.set(conversationId, conversation);
        
        // Update session stats
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const tokensUsed = lastMessage.metadata?.tokensUsed || 0;
        const cost = lastMessage.metadata?.cost || 0;
        
        set({
          conversations: updatedConversations,
          sessionStats: {
            ...state.sessionStats,
            totalCommands: state.sessionStats.totalCommands + 1,
            totalTokens: state.sessionStats.totalTokens + tokensUsed,
            totalCost: state.sessionStats.totalCost + cost
          }
        });
      }

      // Execute any actions returned by the AI
      if (result.actions && result.actions.length > 0) {
        await get().executeActions(result.actions);
      }

      toast({
        title: "Command executed successfully",
        description: `AI response generated (${result.type})`,
      });

    } catch (error) {
      console.error('Command execution error:', error);
      
      toast({
        title: "Command execution failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      set({ isProcessing: false });
    }
  },

  createNewConversation: () => {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set({ currentConversationId: conversationId });
    return conversationId;
  },

  switchConversation: (conversationId: string) => {
    set({ currentConversationId: conversationId });
  },

  deleteConversation: (conversationId: string) => {
    const state = get();
    const updatedConversations = new Map(state.conversations);
    updatedConversations.delete(conversationId);
    
    aiService.deleteConversation(conversationId);
    
    set({
      conversations: updatedConversations,
      currentConversationId: state.currentConversationId === conversationId ? '' : state.currentConversationId
    });
    
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed",
    });
  },

  generateSuggestions: (input: string) => {
    const suggestions = generateSmartSuggestions(input, get().workflowContext);
    set({ suggestions });
  },

  clearSuggestions: () => {
    set({ suggestions: [] });
  },

  updateAIConfig: (config) => {
    set({ aiConfig: { ...get().aiConfig, ...config } });
  },

  updateWorkflowContext: (context) => {
    set({ workflowContext: { ...get().workflowContext, ...context } });
  },

  setApiKey: (provider, apiKey) => {
    aiService.setApiKey(provider, apiKey);
    toast({
      title: "API Key updated",
      description: `${provider} API key has been configured`,
    });
  },

  loadConversations: () => {
    const conversations = aiService.getAllConversations();
    set({ conversations });
  },

  exportConversation: (conversationId: string) => {
    const conversation = get().conversations.get(conversationId);
    if (conversation) {
      const exportData = {
        conversation,
        exportedAt: new Date(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${conversationId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  },

  importConversation: (data: any) => {
    try {
      const conversation: AIConversation = {
        ...data.conversation,
        createdAt: new Date(data.conversation.createdAt),
        updatedAt: new Date(data.conversation.updatedAt),
        messages: data.conversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
      
      const updatedConversations = new Map(get().conversations);
      updatedConversations.set(conversation.id, conversation);
      
      set({ conversations: updatedConversations });
      
      toast({
        title: "Conversation imported",
        description: "The conversation has been added to your history",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Could not import the conversation data",
        variant: "destructive"
      });
    }
  },

  clearAllData: () => {
    aiService.clearAllConversations();
    set({
      currentConversationId: '',
      conversations: new Map(),
      suggestions: [],
      sessionStats: {
        totalCommands: 0,
        totalTokens: 0,
        totalCost: 0,
        sessionStartTime: new Date()
      }
    });
    
    toast({
      title: "All data cleared",
      description: "Conversations and session data have been reset",
    });
  },

  getSessionStats: () => get().sessionStats,

  // Helper method to execute AI-generated actions
  executeActions: async (actions: Array<{ type: string; data: any }>) => {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'CREATE_NODE':
            // Integration with workflow system
            console.log('Creating node:', action.data);
            break;
          case 'UPDATE_WORKFLOW':
            // Update current workflow
            console.log('Updating workflow:', action.data);
            break;
          case 'RUN_CODE':
            // Execute code snippet
            console.log('Running code:', action.data);
            break;
          default:
            console.log('Unknown action type:', action.type);
        }
      } catch (error) {
        console.error('Failed to execute action:', action, error);
      }
    }
  }
}));

// Smart suggestion generation
function generateSmartSuggestions(input: string, context: any): SuggestionType[] {
  const suggestions: SuggestionType[] = [];
  const lowercaseInput = input.toLowerCase();

  // Workflow-specific suggestions
  if (context.currentWorkflow) {
    suggestions.push({
      command: `Add a new AI model node to the current workflow`,
      type: 'workflow',
      confidence: 0.9,
      description: 'Creates a new AI processing node'
    });
    
    suggestions.push({
      command: `Connect the selected nodes in sequence`,
      type: 'workflow',
      confidence: 0.85,
      description: 'Links nodes with automatic data flow'
    });
  }

  // Code suggestions
  if (lowercaseInput.includes('code') || lowercaseInput.includes('function') || lowercaseInput.includes('component')) {
    suggestions.push({
      command: `Generate a React component for ${input.replace(/code|function|component/gi, '').trim()}`,
      type: 'code',
      confidence: 0.9,
      description: 'Creates a new React component'
    });
    
    suggestions.push({
      command: `Create a TypeScript interface for ${input}`,
      type: 'code',
      confidence: 0.85,
      description: 'Generates type definitions'
    });
  }

  // UI suggestions
  if (lowercaseInput.includes('ui') || lowercaseInput.includes('design') || lowercaseInput.includes('interface')) {
    suggestions.push({
      command: `Design a modern UI for ${input.replace(/ui|design|interface/gi, '').trim()}`,
      type: 'ui',
      confidence: 0.88,
      description: 'Creates UI with Tailwind CSS'
    });
  }

  // General suggestions
  suggestions.push({
    command: `Explain how to implement ${input}`,
    type: 'general',
    confidence: 0.7,
    description: 'Provides detailed explanation'
  });

  suggestions.push({
    command: `Show me best practices for ${input}`,
    type: 'general',
    confidence: 0.75,
    description: 'Lists recommended approaches'
  });

  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}
