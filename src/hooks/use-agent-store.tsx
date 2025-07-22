
import { useState, useEffect } from 'react';
import { toast } from './use-toast';

export interface AgentType {
  id: string;
  name: string;
  description: string;
  creator: string;
  rating: number;
  reviews: number;
  price: string;
  categories: string[];
  coverImage?: string;
  created?: string;
  capabilities?: string[];
  performance?: {
    responseTime: number;
    successRate: number;
    totalUses: number;
  };
}

export interface AgentCategory {
  name: string;
  count: number;
}

const mockAgents: AgentType[] = [
  {
    id: 'agent-1',
    name: 'Marketing Specialist',
    description: 'Expert in digital marketing strategy, content creation, and campaign optimization. Specializes in social media marketing and brand awareness.',
    creator: 'AImpact Labs',
    rating: 4.9,
    reviews: 234,
    price: '$49/month',
    categories: ['Marketing', 'Content', 'Social Media'],
    created: '2024-01-15',
    capabilities: ['Strategy Development', 'Content Creation', 'Analytics'],
    performance: {
      responseTime: 1200,
      successRate: 96,
      totalUses: 1240
    }
  },
  {
    id: 'agent-2',
    name: 'Sales Expert',
    description: 'Advanced sales automation and lead qualification agent. Handles CRM integration, lead scoring, and sales pipeline management.',
    creator: 'SalesFlow AI',
    rating: 4.7,
    reviews: 189,
    price: '$79/month',
    categories: ['Sales', 'CRM', 'Automation'],
    created: '2024-01-20',
    capabilities: ['Lead Qualification', 'Pipeline Management', 'CRM Integration'],
    performance: {
      responseTime: 950,
      successRate: 94,
      totalUses: 890
    }
  },
  {
    id: 'agent-3',
    name: 'Content Creator',
    description: 'AI-powered content generation for blogs, social media, and marketing materials. Supports multiple languages and content formats.',
    creator: 'ContentGenius',
    rating: 4.8,
    reviews: 312,
    price: 'Free',
    categories: ['Content', 'Writing', 'SEO'],
    created: '2024-02-01',
    capabilities: ['Blog Writing', 'Social Posts', 'SEO Optimization'],
    performance: {
      responseTime: 800,
      successRate: 98,
      totalUses: 2100
    }
  },
  {
    id: 'agent-4',
    name: 'Data Analyst',
    description: 'Comprehensive data analysis and visualization agent. Handles complex datasets, generates insights, and creates automated reports.',
    creator: 'DataInsights Pro',
    rating: 4.6,
    reviews: 156,
    price: '$99/month',
    categories: ['Analytics', 'Data', 'Reports'],
    created: '2024-02-10',
    capabilities: ['Data Analysis', 'Visualization', 'Report Generation'],
    performance: {
      responseTime: 1500,
      successRate: 92,
      totalUses: 670
    }
  },
  {
    id: 'agent-5',
    name: 'Customer Support AI',
    description: 'Intelligent customer service agent with natural language processing. Handles inquiries, escalations, and knowledge base integration.',
    creator: 'SupportBot Inc',
    rating: 4.5,
    reviews: 428,
    price: '$35/month',
    categories: ['Support', 'Customer Service', 'Chat'],
    created: '2024-02-15',
    capabilities: ['Query Resolution', 'Escalation Handling', 'Knowledge Base'],
    performance: {
      responseTime: 600,
      successRate: 89,
      totalUses: 3200
    }
  },
  {
    id: 'agent-6',
    name: 'Code Assistant',
    description: 'Advanced programming assistant for code review, debugging, and documentation. Supports multiple programming languages and frameworks.',
    creator: 'DevTools AI',
    rating: 4.9,
    reviews: 567,
    price: '$59/month',
    categories: ['Development', 'Code Review', 'Documentation'],
    created: '2024-02-20',
    capabilities: ['Code Review', 'Bug Detection', 'Documentation'],
    performance: {
      responseTime: 1100,
      successRate: 97,
      totalUses: 1800
    }
  }
];

export function useAgentStore() {
  const [agents, setAgents] = useState<AgentType[]>(mockAgents);
  const [categories, setCategories] = useState<AgentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hiredAgents, setHiredAgents] = useState<string[]>([]);

  // Calculate categories from agents
  useEffect(() => {
    const categoryMap = new Map<string, number>();
    agents.forEach(agent => {
      agent.categories.forEach(category => {
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
    });

    const categoryList = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    setCategories(categoryList);
  }, [agents]);

  const searchAgents = async (query: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (query.trim()) {
        const filtered = mockAgents.filter(agent =>
          agent.name.toLowerCase().includes(query.toLowerCase()) ||
          agent.description.toLowerCase().includes(query.toLowerCase()) ||
          agent.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
        );
        setAgents(filtered);
      } else {
        setAgents(mockAgents);
      }
      setIsLoading(false);
    }, 500);
  };

  const hireAgent = async (agentId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHiredAgents(prev => [...prev, agentId]);
      
      toast({
        title: "Agent Hired Successfully",
        description: "The agent has been added to your workspace.",
      });
    } catch (error) {
      toast({
        title: "Failed to Hire Agent",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentPerformance = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.performance || {
      responseTime: 1000,
      successRate: 90,
      totalUses: 0
    };
  };

  const getTrendingAgents = () => {
    return agents
      .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
      .slice(0, 6);
  };

  const getTopRatedAgents = () => {
    return agents
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  };

  const getNewestAgents = () => {
    return agents
      .sort((a, b) => new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime())
      .slice(0, 6);
  };

  return {
    agents,
    categories,
    isLoading,
    hiredAgents,
    searchAgents,
    hireAgent,
    getAgentPerformance,
    getTrendingAgents,
    getTopRatedAgents,
    getNewestAgents
  };
}
