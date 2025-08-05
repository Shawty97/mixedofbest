// Demo Configuration for Universal Agent Platform
// This allows the platform to function without real API keys for testing

// Helper to safely access environment variables
const getEnvVar = (key: string): string | undefined => {
  return typeof window !== 'undefined' ? (window as any)[key] : undefined;
};

export const DEMO_CONFIG = {
  // Demo mode enables mock responses
  isDemoMode: getEnvVar('VITE_ENABLE_DEMO_MODE') === 'true',
  
  // Mock API responses
  mockResponses: {
    openai: {
      chat: {
        id: 'chatcmpl-demo123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a demo response from the Universal Agent Platform. In production, this would be a real AI response.'
          },
          finish_reason: 'stop'
        }]
      }
    },
    
    elevenlabs: {
      tts: {
        audio_url: '/demo/audio/sample-voice.mp3',
        voice_id: 'demo-voice-id',
        text: 'Demo text-to-speech response'
      }
    },
    
    azure: {
      speech: {
        text: 'Demo Azure speech synthesis',
        confidence: 0.95
      }
    }
  },

  // Demo agent templates
  demoAgents: [
    {
      id: 'demo-assistant',
      name: 'Demo Assistant',
      description: 'A helpful AI assistant for demonstrations',
      category: 'chat' as const,
      persona: {
        personality: 'Professional and helpful assistant',
        tone: 'professional' as const,
        instructions: 'You are a helpful AI assistant. Always be polite and provide accurate information.',
        greeting: 'Hello! I\'m your demo assistant. How can I help you today?',
        ending_message: 'Thank you for trying the Universal Agent Platform!'
      },
      ai_config: {
        provider: 'openai' as const,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 1000
      },
      capabilities: [
        {
          id: 'chat',
          name: 'Conversational AI',
          type: 'built-in' as const
        },
        {
          id: 'knowledge',
          name: 'Knowledge Retrieval',
          type: 'built-in' as const
        }
      ],
      tools: [],
      knowledge_sources: [],
      security: {
        access_level: 'public' as const,
        rate_limits: {
          requests_per_minute: 60,
          concurrent_sessions: 5
        }
      },
      deployment: {
        environments: ['development'] as const,
        scaling: {
          min_instances: 1,
          max_instances: 3,
          auto_scale: true
        }
      }
    }
  ]
};

// Helper function to check if we're in demo mode
export const isDemoMode = () => DEMO_CONFIG.isDemoMode;

// Helper function to get mock response
export const getMockResponse = (service: string, endpoint: string) => {
  if (!isDemoMode()) return null;
  
  const response = DEMO_CONFIG.mockResponses[service as keyof typeof DEMO_CONFIG.mockResponses];
  if (!response) return null;
  
  return response[endpoint as keyof typeof response] || null;
};

// Mock service implementations for testing
export const mockOpenAI = {
  createChatCompletion: async (params: any): Promise<any> => {
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: 'This is a demo response from OpenAI GPT-4'
        }
      }]
    };
  }
};

export const mockElevenLabs = {
  textToSpeech: async (params: any): Promise<any> => {
    return {
      audio_url: '/demo/audio/sample-voice.mp3',
      voice_id: 'demo-voice-id'
    };
  }
};

export const mockAzure = {
  synthesizeSpeech: async (params: any): Promise<any> => {
    return {
      audio_data: new Uint8Array([0, 1, 2, 3]),
      text: params.text
    };
  }
};