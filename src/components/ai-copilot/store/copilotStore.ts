
import { create } from 'zustand';
import { SuggestionType } from '../CommandSuggestion';
import { toast } from '@/hooks/use-toast';

export interface CommandResult {
  id: string;
  command: string;
  timestamp: number;
  response?: string;
  type: 'code' | 'ui' | 'doc' | 'general';
  status: 'success' | 'error' | 'processing';
  metadata?: Record<string, any>;
}

interface CopilotState {
  sessionId: string;
  suggestions: SuggestionType[];
  sessionHistory: CommandResult[];
  currentHistoryIndex: number;
  isProcessing: boolean;
  contextWindow: Record<string, any>; // Stores persistent context between commands

  // Actions
  sendCommand: (command: string) => Promise<void>;
  generateSuggestions: (input: string) => void;
  clearSuggestions: () => void;
  undoCommand: () => void;
  redoCommand: () => void;
  saveSession: () => Promise<boolean>;
  loadSession: (sessionId: string) => Promise<boolean>;
  clearSession: () => void;
}

export const useCopilotStore = create<CopilotState>((set, get) => ({
  sessionId: `session-${Date.now()}`,
  suggestions: [],
  sessionHistory: [],
  currentHistoryIndex: -1,
  isProcessing: false,
  contextWindow: {},

  sendCommand: async (command) => {
    // Start processing
    set({ isProcessing: true });
    
    try {
      // Determine command type through intent recognition
      const commandType = determineCommandType(command);
      
      // Generate a unique ID for this command
      const commandId = `cmd-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create initial command result
      const newCommand: CommandResult = {
        id: commandId,
        command,
        timestamp: Date.now(),
        type: commandType,
        status: 'processing'
      };

      // Update history - remove any "future" history if we're in the middle of undo stack
      const currentIndex = get().currentHistoryIndex;
      const currentHistory = get().sessionHistory;
      const newHistory = currentIndex < currentHistory.length - 1 
        ? currentHistory.slice(0, currentIndex + 1) 
        : [...currentHistory];

      // Add new command to history
      newHistory.push(newCommand);
      
      set({ 
        sessionHistory: newHistory,
        currentHistoryIndex: newHistory.length - 1,
        suggestions: [] // Clear suggestions
      });

      // Process the command through the appropriate service
      const response = await processCommand(command, commandType, get().contextWindow);
      
      // Update command with response
      set(state => ({
        sessionHistory: state.sessionHistory.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, response, status: 'success' } 
            : cmd
        ),
        isProcessing: false,
        // Update context window with new information
        contextWindow: {
          ...state.contextWindow,
          lastCommand: command,
          lastResponse: response,
          commandCount: (state.contextWindow.commandCount || 0) + 1
        }
      }));

      toast({
        title: "Command executed successfully",
        description: commandTypeToDescription(commandType),
      });
    } catch (error) {
      console.error("Error processing command:", error);
      
      // Update the last command with error status
      set(state => ({
        sessionHistory: state.sessionHistory.map((cmd, idx) => 
          idx === state.sessionHistory.length - 1 
            ? { ...cmd, status: 'error', response: error instanceof Error ? error.message : String(error) } 
            : cmd
        ),
        isProcessing: false
      }));

      toast({
        title: "Error executing command",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  },

  generateSuggestions: (input) => {
    // This would call the backend to get real suggestions
    // For now, we'll use mock suggestions based on input patterns
    const suggestions = generateMockSuggestions(input);
    set({ suggestions });
  },

  clearSuggestions: () => {
    set({ suggestions: [] });
  },

  undoCommand: () => {
    const { currentHistoryIndex } = get();
    if (currentHistoryIndex > 0) {
      set({ currentHistoryIndex: currentHistoryIndex - 1 });
      
      toast({
        title: "Command undone",
        description: "You can redo this action if needed",
      });
    }
  },

  redoCommand: () => {
    const { currentHistoryIndex, sessionHistory } = get();
    if (currentHistoryIndex < sessionHistory.length - 1) {
      set({ currentHistoryIndex: currentHistoryIndex + 1 });
      
      toast({
        title: "Command redone",
        description: "Action has been restored",
      });
    }
  },

  saveSession: async () => {
    const { sessionId, sessionHistory, contextWindow } = get();
    
    try {
      // In a real app, this would save to a backend service
      localStorage.setItem(`copilot-session-${sessionId}`, JSON.stringify({
        sessionId,
        sessionHistory,
        contextWindow,
        savedAt: Date.now()
      }));
      
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  },

  loadSession: async (sessionId) => {
    try {
      // In a real app, this would load from a backend service
      const savedSession = localStorage.getItem(`copilot-session-${sessionId}`);
      
      if (!savedSession) {
        return false;
      }
      
      const parsedSession = JSON.parse(savedSession);
      
      set({
        sessionId: parsedSession.sessionId,
        sessionHistory: parsedSession.sessionHistory,
        currentHistoryIndex: parsedSession.sessionHistory.length - 1,
        contextWindow: parsedSession.contextWindow
      });
      
      return true;
    } catch (error) {
      console.error("Error loading session:", error);
      return false;
    }
  },

  clearSession: () => {
    set({
      suggestions: [],
      sessionHistory: [],
      currentHistoryIndex: -1,
      contextWindow: {},
      sessionId: `session-${Date.now()}`
    });
  }
}));

// Helper functions

function determineCommandType(command: string): 'code' | 'ui' | 'doc' | 'general' {
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes('generate') || lowerCommand.includes('create')) {
    if (lowerCommand.includes('code') || lowerCommand.includes('function') || 
        lowerCommand.includes('class') || lowerCommand.includes('component')) {
      return 'code';
    }
    
    if (lowerCommand.includes('ui') || lowerCommand.includes('interface') || 
        lowerCommand.includes('button') || lowerCommand.includes('layout')) {
      return 'ui';
    }
    
    if (lowerCommand.includes('document') || lowerCommand.includes('documentation') || 
        lowerCommand.includes('readme') || lowerCommand.includes('explain')) {
      return 'doc';
    }
  }
  
  return 'general';
}

function commandTypeToDescription(type: 'code' | 'ui' | 'doc' | 'general'): string {
  switch (type) {
    case 'code':
      return "Code generation completed";
    case 'ui':
      return "UI component generated";
    case 'doc':
      return "Documentation created";
    case 'general':
    default:
      return "AI assistant response received";
  }
}

async function processCommand(
  command: string, 
  type: 'code' | 'ui' | 'doc' | 'general',
  context: Record<string, any>
): Promise<string> {
  // In a real implementation, this would make API calls to appropriate services
  // For now, simulate a delay and return mock responses
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  switch (type) {
    case 'code':
      return `// Generated code for: ${command}\nfunction processRequest() {\n  // Implementation based on command\n  return { success: true };\n}`;
    case 'ui':
      return `<Component title="${command.replace(/"/g, '\\"')}">\n  <div>Generated UI based on your request</div>\n</Component>`;
    case 'doc':
      return `# Documentation\n\n## Overview\nThis document explains the functionality requested in: "${command}"\n\n## Usage\nFollow these steps to implement...`;
    case 'general':
    default:
      return `I've processed your request: "${command}". Here's what I can help you with...`;
  }
}

function generateMockSuggestions(input: string): SuggestionType[] {
  const lowercaseInput = input.toLowerCase();
  const suggestions: SuggestionType[] = [];

  // Code suggestions
  if (lowercaseInput.includes('code') || lowercaseInput.includes('function') || lowercaseInput.includes('component')) {
    suggestions.push({
      command: `Generate a React component for ${input}`,
      type: 'code',
      confidence: 0.9
    });
    suggestions.push({
      command: `Create a utility function to handle ${input}`,
      type: 'code',
      confidence: 0.85
    });
  }

  // UI suggestions
  if (lowercaseInput.includes('ui') || lowercaseInput.includes('design') || lowercaseInput.includes('interface')) {
    suggestions.push({
      command: `Design a user interface for ${input}`,
      type: 'ui',
      confidence: 0.88
    });
    suggestions.push({
      command: `Create a layout for ${input} page`,
      type: 'ui',
      confidence: 0.82
    });
  }

  // Documentation suggestions
  if (lowercaseInput.includes('doc') || lowercaseInput.includes('explain') || lowercaseInput.includes('help')) {
    suggestions.push({
      command: `Generate documentation for ${input}`,
      type: 'doc',
      confidence: 0.87
    });
    suggestions.push({
      command: `Explain how ${input} works`,
      type: 'doc',
      confidence: 0.81
    });
  }

  // General suggestions
  suggestions.push({
    command: `Tell me more about ${input}`,
    type: 'general',
    confidence: 0.75
  });

  // Limit to max 5 suggestions, prioritize by confidence
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}
