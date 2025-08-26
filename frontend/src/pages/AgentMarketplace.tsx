import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, Star, Download, DollarSign, Bot, Loader2 } from 'lucide-react';
import { apiService, Agent } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

export function AgentMarketplace() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketplaceAgents();
  }, []);

  const loadMarketplaceAgents = async () => {
    try {
      setLoading(true);
      const agentList = await apiService.getAgents();
      setAgents(agentList);
    } catch (error) {
      console.error('Error loading marketplace agents:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace agents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseAgent = async (agentId: string) => {
    try {
      // For demo purposes, show success message
      const agent = agents.find(a => (a._id || a.agent_id) === agentId);
      toast({
        title: "Agent Purchased!",
        description: `${agent?.name} has been added to your collection`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to purchase agent",
        variant: "destructive",
      });
    }
  };

  const getAgentPrice = (agent: Agent) => {
    // Generate demo prices based on agent type
    const basePrices: { [key: string]: number } = {
      'voice': 49.99,
      'chat': 29.99,
      'workflow': 79.99,
      'analytics': 99.99
    };
    return basePrices[agent.type?.toLowerCase() || 'chat'] || 39.99;
  };

  const getAgentRating = () => {
    // Generate random rating between 4.0 and 5.0
    return (4.0 + Math.random()).toFixed(1);
  };

  const getAgentDownloads = () => {
    // Generate random download count
    return Math.floor(Math.random() * 2000) + 100;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and purchase pre-built agent templates from our community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading marketplace agents...</span>
          </div>
        ) : agents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Agents Available</h3>
            <p className="text-muted-foreground mb-4">Check back later for new agent templates</p>
            <Button onClick={() => window.location.href = '/agent-studio'}>Create Your Own</Button>
          </div>
        ) : (
          agents.map((agent) => {
            const price = getAgentPrice(agent);
            const rating = getAgentRating();
            const downloads = getAgentDownloads();
            
            return (
              <Card key={agent._id || agent.agent_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{agent.type || 'Agent'}</Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{rating}</span>
                    </div>
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    {agent.name}
                  </CardTitle>
                  <CardDescription>
                    {agent.description || 'Professional AI agent template ready for deployment'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {agent.status}
                      </Badge>
                    </div>
                    {agent.capabilities && agent.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 2).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.capabilities.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">${price}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Download className="h-4 w-4" />
                      <span className="text-sm">{downloads}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handlePurchaseAgent(agent._id || agent.agent_id)}
                    disabled={agent.status !== 'active'}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}