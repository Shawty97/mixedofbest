import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Download, Star, Users, Zap, Shield, Phone } from 'lucide-react';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  price: 'free' | number;
  features: string[];
  author: string;
  verified: boolean;
}

interface DeployedAgent {
  id: string;
  name: string;
  templateId: string;
  status: 'active' | 'inactive' | 'updating';
  deployedAt: string;
  callsToday: number;
  endpoint: string;
}

export default function Store() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [templates] = useState<AgentTemplate[]>([
    {
      id: 'template-1',
      name: 'Customer Support Pro',
      description: 'Advanced customer support agent with CRM integration and sentiment analysis',
      category: 'customer-service',
      rating: 4.8,
      downloads: 1250,
      price: 'free',
      features: ['CRM Integration', 'Sentiment Analysis', 'Multi-language', 'Call Transfer'],
      author: 'AImpact Team',
      verified: true
    },
    {
      id: 'template-2',
      name: 'Sales Assistant Elite',
      description: 'High-converting sales agent with lead qualification and appointment booking',
      category: 'sales',
      rating: 4.9,
      downloads: 890,
      price: 29,
      features: ['Lead Qualification', 'Calendar Integration', 'Follow-up Automation', 'Analytics'],
      author: 'SalesBot Inc',
      verified: true
    },
    {
      id: 'template-3',
      name: 'Healthcare Scheduler',
      description: 'HIPAA-compliant medical appointment scheduling and patient support',
      category: 'healthcare',
      rating: 4.7,
      downloads: 456,
      price: 49,
      features: ['HIPAA Compliant', 'EHR Integration', 'Appointment Scheduling', 'Prescription Reminders'],
      author: 'MedTech Solutions',
      verified: true
    },
    {
      id: 'template-4',
      name: 'Restaurant Reservations',
      description: 'Smart restaurant booking agent with menu recommendations',
      category: 'hospitality',
      rating: 4.6,
      downloads: 234,
      price: 'free',
      features: ['Table Booking', 'Menu Integration', 'Special Requests', 'Waitlist Management'],
      author: 'RestaurantAI',
      verified: false
    }
  ]);

  const [deployedAgents] = useState<DeployedAgent[]>([
    {
      id: 'deployed-1',
      name: 'My Customer Support',
      templateId: 'template-1',
      status: 'active',
      deployedAt: '2024-01-15',
      callsToday: 23,
      endpoint: 'https://api.aiimpact.com/agents/deployed-1'
    },
    {
      id: 'deployed-2',
      name: 'Sales Team Assistant',
      templateId: 'template-2',
      status: 'inactive',
      deployedAt: '2024-01-10',
      callsToday: 0,
      endpoint: 'https://api.aiimpact.com/agents/deployed-2'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'customer-service', name: 'Customer Service' },
    { id: 'sales', name: 'Sales' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'hospitality', name: 'Hospitality' },
    { id: 'education', name: 'Education' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeploy = (templateId: string) => {
    console.log('Deploying template:', templateId);
    // Implementation for deploying an agent
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customer-service': return <Users className="h-4 w-4" />;
      case 'sales': return <Zap className="h-4 w-4" />;
      case 'healthcare': return <Shield className="h-4 w-4" />;
      case 'hospitality': return <Phone className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Store</h1>
          <p className="text-muted-foreground">
            Discover, deploy, and manage voice agent templates
          </p>
        </div>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="deployed">My Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agent templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <Badge variant="secondary" className="text-xs">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    {template.verified && (
                      <Badge variant="default" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {template.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {template.downloads}
                    </div>
                    <div className="text-sm">
                      by {template.author}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.features.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="text-lg font-bold">
                      {template.price === 'free' ? 'Free' : `$${template.price}`}
                    </div>
                    <Button onClick={() => handleDeploy(template.id)}>
                      Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deployed" className="space-y-4">
          <div className="grid gap-4">
            {deployedAgents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>
                      Deployed on {new Date(agent.deployedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{agent.status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Calls Today</p>
                      <p className="font-medium">{agent.callsToday}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Endpoint</p>
                      <p className="font-medium font-mono text-xs truncate">{agent.endpoint}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Template</p>
                      <p className="font-medium">{templates.find(t => t.id === agent.templateId)?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      View Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deployedAgents.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {deployedAgents.filter(a => a.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((deployedAgents.filter(a => a.status === 'active').length / deployedAgents.length) * 100)}% uptime
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {deployedAgents.reduce((sum, agent) => sum + agent.callsToday, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}