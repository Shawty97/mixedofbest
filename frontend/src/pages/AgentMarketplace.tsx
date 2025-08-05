import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, Star, Download, DollarSign } from 'lucide-react';

export function AgentMarketplace() {
  const featuredAgents = [
    {
      id: '1',
      name: 'Customer Support Pro',
      description: 'Advanced customer support agent with CRM integration',
      category: 'Support',
      price: 49.99,
      rating: 4.8,
      downloads: 1200
    },
    {
      id: '2', 
      name: 'Sales Assistant AI',
      description: 'Lead qualification and sales automation specialist',
      category: 'Sales',
      price: 79.99,
      rating: 4.9,
      downloads: 850
    },
    {
      id: '3',
      name: 'Quantum Optimizer',
      description: 'Quantum-powered optimization for complex problems',
      category: 'Quantum',
      price: 199.99,
      rating: 4.7,
      downloads: 234
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and purchase pre-built agent templates from our community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{agent.category}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{agent.rating}</span>
                </div>
              </div>
              <CardTitle>{agent.name}</CardTitle>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">${agent.price}</span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  <span className="text-sm">{agent.downloads}</span>
                </div>
              </div>
              <Button className="w-full">
                <Store className="mr-2 h-4 w-4" />
                Purchase
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}