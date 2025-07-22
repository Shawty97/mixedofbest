
import { useState, useCallback, useEffect } from 'react';
import { AgentType } from './use-agent-store';
import { AgentSchema, AgentBlueprint, AgentVertical } from '@/types/agent.types';
import { toast } from './use-toast';

export function useAgentMarketplace() {
  const [agentBlueprints, setAgentBlueprints] = useState<AgentBlueprint[]>([]);
  const [featuredAgents, setFeaturedAgents] = useState<AgentBlueprint[]>([]);
  const [verticals, setVerticals] = useState<AgentVertical[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with mock data
  useEffect(() => {
    const initializeMarketplace = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockBlueprints: AgentBlueprint[] = [
        {
          id: 'marketing-specialist',
          name: 'Marketing Specialist',
          description: 'A specialized agent for social media marketing strategy, content creation, and campaign management.',
          version: '1.0.0',
          capabilities: [
            {
              id: 'social-analysis',
              name: 'Social Media Analysis',
              description: 'Analyzes social media trends and audience engagement',
              category: 'analytics'
            },
            {
              id: 'content-generation',
              name: 'Content Generation',
              description: 'Creates engaging posts and captions for various platforms',
              category: 'content'
            }
          ],
          tools: [
            {
              id: 'trend-analyzer',
              name: 'Trend Analyzer',
              description: 'Identifies current trends in social media',
              isInternal: true
            }
          ],
          creator: {
            id: 'system',
            name: 'AI Platform',
            avatar: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a'
          },
          pricing: {
            model: 'free'
          },
          stats: {
            rating: 4.8,
            reviews: 124,
            downloads: 3568,
            lastUpdated: new Date('2025-03-15')
          },
          tags: ['marketing', 'social media', 'content creation'],
          isVerified: true,
          isPublic: true,
          coverImage: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=2070&auto=format&fit=crop',
          verticals: ['marketing']
        },
        {
          id: 'legal-assistant',
          name: 'Legal Assistant',
          description: 'Expert in contract review, legal research, and regulatory compliance analysis.',
          version: '1.0.0',
          capabilities: [
            {
              id: 'contract-review',
              name: 'Contract Review',
              description: 'Analyzes legal contracts for potential issues',
              category: 'analytics'
            },
            {
              id: 'legal-research',
              name: 'Legal Research',
              description: 'Conducts research on legal precedents and regulations',
              category: 'data'
            }
          ],
          tools: [
            {
              id: 'clause-extractor',
              name: 'Clause Extractor',
              description: 'Extracts and analyzes specific clauses from contracts',
              isInternal: true
            }
          ],
          creator: {
            id: 'legalai',
            name: 'LegalAI Inc.',
            avatar: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb'
          },
          pricing: {
            model: 'paid',
            price: 29.99,
            currency: 'USD'
          },
          stats: {
            rating: 4.9,
            reviews: 87,
            downloads: 1245,
            lastUpdated: new Date('2025-04-02')
          },
          tags: ['legal', 'contracts', 'compliance', 'research'],
          isVerified: true,
          isPublic: true,
          coverImage: 'https://images.unsplash.com/photo-1589216957132-7417a8238462?q=80&w=2070&auto=format&fit=crop',
          verticals: ['legal']
        },
        {
          id: 'dev-assistant',
          name: 'Development God',
          description: 'Advanced coding assistant that provides code generation, debugging, and optimization across multiple languages.',
          version: '1.1.0',
          capabilities: [
            {
              id: 'code-generation',
              name: 'Code Generation',
              description: 'Creates code snippets and functions based on requirements',
              category: 'code'
            },
            {
              id: 'code-review',
              name: 'Code Review',
              description: 'Analyzes code for bugs, security issues and optimization opportunities',
              category: 'analytics'
            }
          ],
          tools: [
            {
              id: 'syntax-validator',
              name: 'Syntax Validator',
              description: 'Validates syntax across multiple programming languages',
              isInternal: true
            }
          ],
          creator: {
            id: 'devtools',
            name: 'DevTools AI',
            avatar: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f'
          },
          pricing: {
            model: 'subscription',
            price: 19.99,
            currency: 'USD'
          },
          stats: {
            rating: 4.7,
            reviews: 203,
            downloads: 5689,
            lastUpdated: new Date('2025-04-20')
          },
          tags: ['development', 'coding', 'debugging', 'react', 'typescript'],
          isVerified: true,
          isPublic: true,
          coverImage: 'https://images.unsplash.com/photo-1607706189992-eae578626c86?q=80&w=2070&auto=format&fit=crop',
          verticals: ['development']
        }
      ];
      
      setAgentBlueprints(mockBlueprints);
      setFeaturedAgents(mockBlueprints.slice(0, 3));
      setVerticals(['marketing', 'legal', 'development', 'design', 'writing', 'analytics']);
      setIsLoading(false);
    };
    
    initializeMarketplace();
  }, []);
  
  const createAgent = useCallback((agent: AgentSchema): AgentBlueprint => {
    const newBlueprint: AgentBlueprint = {
      ...agent,
      creator: {
        id: 'user-1',
        name: 'Current User'
      },
      pricing: {
        model: 'free'
      },
      stats: {
        rating: 0,
        reviews: 0,
        downloads: 0,
        lastUpdated: new Date()
      },
      tags: agent.capabilities.map(c => c.category),
      isVerified: false,
      isPublic: false,
      verticals: agent.verticals
    };
    
    setAgentBlueprints(prev => [newBlueprint, ...prev]);
    
    toast({
      title: "Agent Created",
      description: `${newBlueprint.name} has been added to your agents.`
    });
    
    return newBlueprint;
  }, []);
  
  const combineAgents = useCallback((selectedIds: string[], name: string, description: string): AgentBlueprint | null => {
    const selectedAgents = agentBlueprints.filter(agent => selectedIds.includes(agent.id));
    
    if (selectedAgents.length < 2) {
      toast({
        title: "Combination Error",
        description: "You need to select at least 2 agents to combine.",
        variant: "destructive"
      });
      return null;
    }
    
    // Combine capabilities
    const combinedCapabilities = selectedAgents.flatMap(agent => agent.capabilities)
      .filter((capability, index, self) => 
        index === self.findIndex(c => c.id === capability.id)
      );
    
    // Combine tools
    const combinedTools = selectedAgents.flatMap(agent => agent.tools)
      .filter((tool, index, self) => 
        index === self.findIndex(t => t.id === tool.id)
      );
    
    // Combine verticals
    const combinedVerticals = selectedAgents.flatMap(agent => agent.verticals)
      .filter((vertical, index, self) => 
        index === self.findIndex(v => v === vertical)
      );
    
    // Create new blueprint
    const newBlueprint: AgentBlueprint = {
      id: `combined-${Date.now()}`,
      name,
      description,
      version: '1.0.0',
      capabilities: combinedCapabilities,
      tools: combinedTools,
      verticals: combinedVerticals,
      creator: {
        id: 'user-1',
        name: 'Current User'
      },
      pricing: {
        model: 'free'
      },
      stats: {
        rating: 0,
        reviews: 0,
        downloads: 0,
        lastUpdated: new Date()
      },
      tags: [...new Set(selectedAgents.flatMap(agent => agent.tags))],
      isVerified: false,
      isPublic: false
    };
    
    setAgentBlueprints(prev => [newBlueprint, ...prev]);
    
    toast({
      title: "Agents Combined",
      description: `${newBlueprint.name} has been created from ${selectedAgents.length} agents.`
    });
    
    return newBlueprint;
  }, [agentBlueprints]);
  
  const hireAgent = useCallback((agentId: string) => {
    toast({
      title: "Agent Hired",
      description: "The agent has been added to your workspace."
    });
    
    // Here you would actually integrate the agent into the user's workspace
  }, []);
  
  const testAgent = useCallback((agentId: string) => {
    toast({
      title: "Test Session Started",
      description: "You can now interact with the agent in test mode."
    });
    
    // Here you would initiate a test session with the agent
  }, []);
  
  return {
    agentBlueprints,
    featuredAgents,
    verticals,
    isLoading,
    createAgent,
    combineAgents,
    hireAgent,
    testAgent
  };
}
