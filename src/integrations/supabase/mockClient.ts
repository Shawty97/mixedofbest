// Mock Supabase client for demo mode
// This provides a fully functional demo without requiring real Supabase

import { DEMO_CONFIG } from '@/config/demo';

// Mock auth user
const MOCK_USER = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: null
  }
};

// Mock session
const MOCK_SESSION = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  user: MOCK_USER,
  expires_in: 3600,
  expires_at: Date.now() + 3600000
};

// Mock database data
const MOCK_DATA = {
  universal_agents: [
    {
      id: 'demo-agent-1',
      definition: DEMO_CONFIG.demoAgents[0],
      status: 'published',
      user_id: 'demo-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  agent_instances: [
    {
      id: 'demo-instance-1',
      template_id: 'demo-agent-1',
      name: 'Demo Agent Instance',
      environment: 'development',
      status: 'running',
      user_id: 'demo-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  knowledge_documents: [
    {
      id: 'demo-doc-1',
      title: 'Demo Knowledge Document',
      content: 'This is a demo knowledge document for testing the Universal Agent Platform.',
      user_id: 'demo-user-123',
      created_at: new Date().toISOString()
    }
  ]
};

// Mock Supabase client
export const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === 'demo@example.com' && password === 'demo123') {
        return { data: { user: MOCK_USER, session: MOCK_SESSION }, error: null };
      }
      return { data: null, error: { message: 'Invalid credentials' } };
    },
    
    signUp: async ({ email, password }: { email: string; password: string }) => {
      return { data: { user: MOCK_USER, session: MOCK_SESSION }, error: null };
    },
    
    signOut: async () => {
      return { error: null };
    },
    
    getUser: async () => {
      return { data: { user: MOCK_USER }, error: null };
    },
    
    getSession: async () => {
      return { data: { session: MOCK_SESSION }, error: null };
    },
    
    onAuthStateChange: (callback: any) => {
      // Simulate auth state changes
      setTimeout(() => {
        callback('SIGNED_IN', MOCK_SESSION);
      }, 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  
  from: (table: string) => {
    const data = MOCK_DATA[table as keyof typeof MOCK_DATA] || [];
    
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const item = data.find((item: any) => item[column] === value);
            return { data: item || null, error: null };
          },
          
          order: (column: string, options: any) => ({
            execute: async () => ({ data, error: null })
          }),
          
          execute: async () => ({ data, error: null })
        }),
        
        single: async () => {
          return { data: data[0] || null, error: null };
        },
        
        order: (column: string, options: any) => ({
          execute: async () => ({ data, error: null })
        }),
        
        execute: async () => ({ data, error: null })
      }),
      
      insert: (values: any) => ({
        select: () => ({
          single: async () => {
            const newItem = { ...values, id: `demo-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            return { data: newItem, error: null };
          }
        })
      }),
      
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              const item = data.find((item: any) => item[column] === value);
              if (item) {
                Object.assign(item, values, { updated_at: new Date().toISOString() });
              }
              return { data: item || null, error: null };
            }
          })
        })
      }),
      
      delete: () => ({
        eq: (column: string, value: any) => ({
          execute: async () => ({ error: null })
        })
      })
    };
  },
  
  functions: {
    invoke: (functionName: string, options: any) => {
      const mockResponses = {
        'deploy-universal-agent': {
          deployment_id: 'demo-deployment-123',
          endpoint: 'http://localhost:8080/api/demo-agent',
          status: 'deployed'
        },
        'ai-chat': {
          response: 'This is a demo AI response from the Universal Agent Platform.',
          tokens_used: 150,
          model: 'gpt-4'
        },
        'knowledge-search': {
          results: [
            {
              id: 'demo-result-1',
              content: 'Demo knowledge search result',
              score: 0.95
            }
          ]
        }
      };
      
      return Promise.resolve({
        data: mockResponses[functionName as keyof typeof mockResponses] || { success: true },
        error: null
      });
    }
  }
};

// Export for conditional usage
export const getSupabaseClient = () => {
  const isDemoMode = typeof window !== 'undefined' && (window as any).VITE_ENABLE_DEMO_MODE === 'true';
  return isDemoMode ? mockSupabase : null;
};