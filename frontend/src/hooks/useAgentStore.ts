import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  voice_id?: string;
  greeting?: string;
  instructions?: string;
  ending_message?: string;
  capabilities?: string[];
  webhook_url?: string;
}

export function useAgentStore() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Customer Support Agent',
      description: 'Handles customer inquiries and support requests',
      voice_id: 'en-US-JennyNeural',
      greeting: 'Hello! How can I help you today?',
      instructions: 'You are a helpful customer support agent. Be friendly and professional.',
      ending_message: 'Thank you for contacting us. Have a great day!',
      capabilities: ['crm', 'transfer']
    },
    {
      id: '2',
      name: 'Sales Assistant',
      description: 'Helps with sales inquiries and product information',
      voice_id: 'en-US-JennyNeural',
      greeting: 'Hi there! I\'m here to help you find the perfect solution.',
      instructions: 'You are a sales assistant. Focus on understanding customer needs and providing relevant product information.',
      ending_message: 'Thanks for your interest! Feel free to reach out if you have more questions.',
      capabilities: ['calendar', 'crm']
    }
  ]);

  const createAgent = () => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: 'New Agent',
      description: 'A new voice agent',
      voice_id: 'en-US-JennyNeural',
      greeting: 'Hello! How can I assist you?',
      instructions: 'You are a helpful assistant.',
      ending_message: 'Thank you for your time!',
      capabilities: []
    };
    setAgents(prev => [...prev, newAgent]);
    return newAgent;
  };

  const updateAgent = (updatedAgent: Agent) => {
    setAgents(prev => prev.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ));
  };

  const deleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
  };

  const testAgent = (agent: Agent) => {
    console.log('Testing agent:', agent);
    // This would integrate with your voice testing service
  };

  return {
    agents,
    createAgent,
    updateAgent,
    deleteAgent,
    testAgent
  };
}