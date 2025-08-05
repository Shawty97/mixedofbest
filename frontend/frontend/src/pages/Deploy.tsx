import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Cloud, 
  Server, 
  Globe, 
  Shield, 
  Zap, 
  Settings, 
  Play, 
  Pause,
  RotateCcw,
  ExternalLink,
  Copy
} from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  agentId: string;
  environment: 'development' | 'staging' | 'production';
  status: 'running' | 'stopped' | 'deploying' | 'error';
  url: string;
  region: string;
  instances: number;
  lastDeployed: string;
  version: string;
}

export default function Deploy() {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: 'deploy-1',
      name: 'Customer Support Production',
      agentId: 'agent-1',
      environment: 'production',
      status: 'running',
      url: 'https://cs-prod.aiimpact.com',
      region: 'us-east-1',
      instances: 3,
      lastDeployed: '2024-01-15 14:30',
      version: 'v1.2.3'
    },
    {
      id: 'deploy-2',
      name: 'Sales Assistant Staging',
      agentId: 'agent-2',
      environment: 'staging',
      status: 'stopped',
      url: 'https://sales-staging.aiimpact.com',
      region: 'us-west-2',
      instances: 1,
      lastDeployed: '2024-01-14 09:15',
      version: 'v1.1.0'
    }
  ]);

  const [newDeployment, setNewDeployment] = useState({
    name: '',
    agentId: '',
    environment: 'development' as const,
    region: 'us-east-1',
    instances: 1,
    autoScale: false
  });

  const regions = [
    { id: 'us-east-1', name: 'US East (N. Virginia)' },
    { id: 'us-west-2', name: 'US West (Oregon)' },
    { id: 'eu-west-1', name: 'Europe (Ireland)' },
    { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-gray-500';
      case 'deploying': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeploy = (deploymentId: string) => {
    setDeployments(prev => prev.map(d => 
      d.id === deploymentId 
        ? { ...d, status: 'deploying' as const }
        : d
    ));
    
    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === deploymentId 
          ? { ...d, status: 'running' as const, lastDeployed: new Date().toLocaleString() }
          : d
      ));
    }, 3000);
  };

  const handleStop = (deploymentId: string) => {
    setDeployments(prev => prev.map(d => 
      d.id === deploymentId 
        ? { ...d, status: 'stopped' as const }
        : d
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deploy</h1>
          <p className="text-muted-foreground">
            Deploy and manage your voice agents across environments
          </p>
        </div>
        <Button>
          <Cloud className="h-4 w-4 mr-2" />
          New Deployment
        </Button>
      </div>

      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployments">Active Deployments</TabsTrigger>
          <TabsTrigger value="create">Create Deployment</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          <div className="grid gap-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(deployment.status)}`} />
                    <div>
                      <CardTitle className="text-lg">{deployment.name}</CardTitle>
                      <CardDescription>
                        Version {deployment.version} • {deployment.region}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getEnvironmentColor(deployment.environment)}>
                      {deployment.environment}
                    </Badge>
                    {deployment.status === 'running' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeploy(deployment.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStop(deployment.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeploy(deployment.id)}
                        disabled={deployment.status === 'deploying'}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{deployment.status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Instances</p>
                      <p className="font-medium">{deployment.instances}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Deployed</p>
                      <p className="font-medium">{deployment.lastDeployed}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Region</p>
                      <p className="font-medium">{deployment.region}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <code className="flex-1 text-sm">{deployment.url}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(deployment.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(deployment.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Deployment</CardTitle>
              <CardDescription>
                Deploy your voice agent to a new environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deployment-name">Deployment Name</Label>
                  <Input
                    id="deployment-name"
                    placeholder="My Agent Production"
                    value={newDeployment.name}
                    onChange={(e) => setNewDeployment(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-select">Agent</Label>
                  <Select value={newDeployment.agentId} onValueChange={(value) => 
                    setNewDeployment(prev => ({ ...prev, agentId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent-1">Customer Support Agent</SelectItem>
                      <SelectItem value="agent-2">Sales Assistant</SelectItem>
                      <SelectItem value="agent-3">Healthcare Scheduler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={newDeployment.environment} onValueChange={(value: any) => 
                    setNewDeployment(prev => ({ ...prev, environment: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={newDeployment.region} onValueChange={(value) => 
                    setNewDeployment(prev => ({ ...prev, region: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instances">Initial Instances</Label>
                  <Input
                    id="instances"
                    type="number"
                    min="1"
                    max="10"
                    value={newDeployment.instances}
                    onChange={(e) => setNewDeployment(prev => ({ 
                      ...prev, 
                      instances: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-scale"
                    checked={newDeployment.autoScale}
                    onCheckedChange={(checked) => 
                      setNewDeployment(prev => ({ ...prev, autoScale: checked }))
                    }
                  />
                  <Label htmlFor="auto-scale">Enable Auto-scaling</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button>
                  <Cloud className="h-4 w-4 mr-2" />
                  Deploy Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deployments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {deployments.filter(d => d.status === 'running').length} running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Instances</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {deployments.reduce((sum, d) => sum + d.instances, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {regions.length} regions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98.5%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days uptime
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}