import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus, Zap, Settings, Save } from 'lucide-react';

export function UniversalStudio() {
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    capabilities: [],
    tools: [],
    schema_definition: {}
  });

  const availableCapabilities = [
    { id: 'voice_synthesis', name: 'Voice Synthesis', category: 'communication' },
    { id: 'text_generation', name: 'Text Generation', category: 'ai' },
    { id: 'web_search', name: 'Web Search', category: 'data' },
    { id: 'quantum_optimization', name: 'Quantum Optimization', category: 'quantum' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Universal Agent Studio</h1>
        <p className="text-muted-foreground">
          Create and configure your universal agent templates with our visual builder.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Agent Configuration</span>
            </CardTitle>
            <CardDescription>
              Define the basic properties of your agent template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="Enter agent name"
                value={agentConfig.name}
                onChange={(e) => setAgentConfig({...agentConfig, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your agent does"
                value={agentConfig.description}
                onChange={(e) => setAgentConfig({...agentConfig, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={agentConfig.version}
                onChange={(e) => setAgentConfig({...agentConfig, version: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Capabilities</span>
            </CardTitle>
            <CardDescription>
              Select the capabilities your agent will have
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {availableCapabilities.map((capability) => (
                <div key={capability.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{capability.name}</p>
                    <Badge variant="outline" className="mt-1">{capability.category}</Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Advanced Settings
        </Button>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </div>
    </div>
  );
}