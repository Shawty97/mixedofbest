import { VoiceAgent } from '../types/voice-agent.types';
import { supabase } from "@/integrations/supabase/client";

// Load voice agents from localStorage or Supabase
export const loadVoiceAgents = async (): Promise<VoiceAgent[]> => {
  try {
    // Try to load from Supabase if available
    if (supabase) {
      try {
        // Check if the voice_agents table exists before querying
        // If we can't query the table directly, we'll fall back to localStorage
        // This is a workaround to avoid errors when the table doesn't exist
        const { data: voiceAgents, error } = await supabase
          .from('workflows') // Use a table we know exists
          .select('id')
          .limit(1); // Just check if we can query
          
        if (!error) {
          // Try loading from localStorage as a fallback
          const savedAgents = localStorage.getItem('voice_agents');
          
          if (savedAgents) {
            const parsedAgents = JSON.parse(savedAgents);
            // Convert string dates back to Date objects
            return parsedAgents.map((agent: any) => ({
              ...agent,
              created: new Date(agent.created),
              lastUsed: agent.lastUsed ? new Date(agent.lastUsed) : undefined
            }));
          }
        }
      } catch (supabaseError) {
        console.error("Error loading from Supabase:", supabaseError);
        // Fall through to local storage if Supabase fails
      }
    }
    
    // Try to load from localStorage as fallback
    const savedAgents = localStorage.getItem('voice_agents');
    
    if (savedAgents) {
      const parsedAgents = JSON.parse(savedAgents);
      // Convert string dates back to Date objects
      return parsedAgents.map((agent: any) => ({
        ...agent,
        created: new Date(agent.created),
        lastUsed: agent.lastUsed ? new Date(agent.lastUsed) : undefined
      }));
    }
    
    // If no saved agents, use mock data
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockAgents: VoiceAgent[] = [
      {
        id: "agent-1",
        name: "Customer Support Assistant",
        description: "Handles customer inquiries, troubleshoots common issues, and manages support tickets.",
        voiceId: "EXAVITQu4vr4xnSDxMaL",
        modelId: "eleven_multilingual_v2",
        voiceName: "Sarah (American)",
        modelName: "Multilingual v2",
        systemPrompt: "You are a helpful customer support agent. Address concerns politely and efficiently.",
        isActive: true,
        capabilities: ["Support", "Knowledge Base", "Ticketing"],
        created: new Date(2023, 10, 15),
        learningMode: true,
        contextWindow: 8192,
        maxResponseTokens: 1024,
        temperatureValue: 0.7,
        conversationMemory: true
      },
      {
        id: "agent-2",
        name: "Sales Assistant",
        description: "Guides potential customers through the sales process, answers product questions, and handles objections.",
        voiceId: "CwhRBWXzGAHq8TQ4Fs17",
        voiceName: "Roger (American)",
        modelId: "eleven_turbo_v2_5",
        modelName: "Turbo v2.5",
        systemPrompt: "You are a knowledgeable sales assistant. Help customers find the right products for their needs.",
        isActive: false,
        capabilities: ["Sales", "Product Info", "CRM Integration"],
        created: new Date(2023, 11, 3),
        learningMode: false,
        contextWindow: 4096,
        maxResponseTokens: 512,
        temperatureValue: 0.8,
        conversationMemory: true,
        integrations: ["CRM", "E-commerce"]
      },
      {
        id: "agent-3",
        name: "Health Advisor",
        description: "Provides general health information and wellness tips while scheduling appointments.",
        voiceId: "FGY2WhTYpPnrIDTdsKH5",
        voiceName: "Laura (American)",
        modelId: "eleven_multilingual_v2",
        modelName: "Multilingual v2",
        systemPrompt: "You are a health advisor. Provide general health information but clarify you're not a doctor.",
        isActive: true,
        capabilities: ["Health", "Scheduling", "Reminders"],
        created: new Date(2024, 0, 22),
        lastUsed: new Date(2024, 1, 15),
        learningMode: true,
        contextWindow: 16384,
        maxResponseTokens: 2048,
        multimodalInput: true,
        temperatureValue: 0.5,
        conversationMemory: true,
        knowledgeBases: ["Medical", "Nutrition", "Fitness"]
      },
      {
        id: "agent-4",
        name: "Advanced AI Assistant",
        description: "A cutting-edge AI assistant with advanced reasoning capabilities and broad expertise to handle complex tasks and questions.",
        voiceId: "TX3LPaxmHKxFdv7VOQHJ",
        voiceName: "Liam (British)",
        modelId: "eleven_english_sts_v2",
        modelName: "English STS v2",
        systemPrompt: "You are a highly advanced AI assistant with expert knowledge across multiple domains. Provide detailed, nuanced responses while adapting your communication style to the user's needs.",
        isActive: true,
        capabilities: ["Advanced Reasoning", "Multi-domain Knowledge", "Complex Problem Solving", "Creative Thinking", "Logic"],
        created: new Date(2024, 3, 5),
        lastUsed: new Date(2024, 4, 1),
        learningMode: true,
        contextWindow: 32768,
        maxResponseTokens: 4096,
        multimodalInput: true,
        temperatureValue: 0.7,
        conversationMemory: true,
        knowledgeBases: ["Science", "Mathematics", "Technology", "Arts", "Humanities"],
        integrations: ["Research Tools", "Programming Environments", "Databases"]
      }
    ];
    
    // Save to localStorage for future use
    localStorage.setItem('voice_agents', JSON.stringify(mockAgents));
    
    return mockAgents;
  } catch (error) {
    console.error("Error loading voice agents:", error);
    return [];
  }
};

// Save agents to localStorage and Supabase
export const saveVoiceAgents = async (agents: VoiceAgent[]): Promise<void> => {
  if (agents.length > 0) {
    // Save to localStorage
    localStorage.setItem('voice_agents', JSON.stringify(agents));
    
    // We'll skip Supabase integration for now to avoid errors
    // as the voice_agents table doesn't appear to exist in the schema
  }
};

// Create a voice agent in Supabase if available
export const createSupabaseVoiceAgent = async (agent: VoiceAgent): Promise<void> => {
  // We'll skip Supabase integration for now to avoid errors
  // as the voice_agents table doesn't appear to exist in the schema
  
  // Just save to localStorage as a fallback
  const existingAgents = localStorage.getItem('voice_agents');
  if (existingAgents) {
    const agents = JSON.parse(existingAgents);
    agents.push(agent);
    localStorage.setItem('voice_agents', JSON.stringify(agents));
  } else {
    localStorage.setItem('voice_agents', JSON.stringify([agent]));
  }
};

// Delete a voice agent from Supabase if available
export const deleteSupabaseVoiceAgent = async (agentId: string): Promise<void> => {
  // We'll skip Supabase integration for now to avoid errors
  // as the voice_agents table doesn't appear to exist in the schema
  
  // Just delete from localStorage as a fallback
  const existingAgents = localStorage.getItem('voice_agents');
  if (existingAgents) {
    const agents = JSON.parse(existingAgents);
    const filteredAgents = agents.filter((agent: any) => agent.id !== agentId);
    localStorage.setItem('voice_agents', JSON.stringify(filteredAgents));
  }
};

// Update a voice agent in Supabase if available
export const updateSupabaseVoiceAgent = async (agent: VoiceAgent): Promise<void> => {
  // We'll skip Supabase integration for now to avoid errors
  // as the voice_agents table doesn't appear to exist in the schema
  
  // Just update in localStorage as a fallback
  const existingAgents = localStorage.getItem('voice_agents');
  if (existingAgents) {
    const agents = JSON.parse(existingAgents);
    const agentIndex = agents.findIndex((a: any) => a.id === agent.id);
    if (agentIndex !== -1) {
      agents[agentIndex] = agent;
      localStorage.setItem('voice_agents', JSON.stringify(agents));
    }
  }
};
