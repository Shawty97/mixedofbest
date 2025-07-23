import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface AgentBuilderProps {
  agent: any;
  onChange: (agent: any) => void;
}

export function AgentBuilder({ agent, onChange }: AgentBuilderProps) {
  const updateAgent = (field: string, value: any) => {
    onChange({ ...agent, [field]: value });
  };

  const toggleCapability = (capability: string) => {
    const capabilities = agent.capabilities || [];
    const newCapabilities = capabilities.includes(capability)
      ? capabilities.filter(c => c !== capability)
      : [...capabilities, capability];
    updateAgent('capabilities', newCapabilities);
  };

  return (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={agent.name || ''}
                onChange={(e) => updateAgent('name', e.target.value)}
                placeholder="Customer Support Agent"
              />
            </div>
            <div>
              <Label htmlFor="voice">Voice Model</Label>
              <Select value={agent.voice_id} onValueChange={(value) => updateAgent('voice_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de-DE-KatjaNeural">Katja (German)</SelectItem>
                  <SelectItem value="en-US-JennyNeural">Jenny (English)</SelectItem>
                  <SelectItem value="es-ES-ElviraNeural">Elvira (Spanish)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={agent.description || ''}
              onChange={(e) => updateAgent('description', e.target.value)}
              placeholder="Brief description of what this agent does"
            />
          </div>
        </CardContent>
      </Card>

      {/* Instructions & Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions & Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="greeting">Greeting Message</Label>
            <Textarea
              id="greeting"
              value={agent.greeting || ''}
              onChange={(e) => updateAgent('greeting', e.target.value)}
              placeholder="Hallo! Wie kann ich Ihnen heute helfen?"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="instructions">System Instructions</Label>
            <Textarea
              id="instructions"
              value={agent.instructions || ''}
              onChange={(e) => updateAgent('instructions', e.target.value)}
              placeholder="You are a helpful customer support agent. Be friendly and professional..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="ending">Ending Message</Label>
            <Textarea
              id="ending"
              value={agent.ending_message || ''}
              onChange={(e) => updateAgent('ending_message', e.target.value)}
              placeholder="Vielen Dank für Ihren Anruf. Haben Sie noch weitere Fragen?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'calendar', label: 'Calendar Integration', description: 'Schedule appointments' },
              { id: 'crm', label: 'CRM Integration', description: 'Update customer records' },
              { id: 'webhook', label: 'Webhook Notifications', description: 'Send call data to external systems' },
              { id: 'transfer', label: 'Call Transfer', description: 'Transfer to human agents' }
            ].map((capability) => (
              <div key={capability.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Switch
                  checked={agent.capabilities?.includes(capability.id) || false}
                  onCheckedChange={() => toggleCapability(capability.id)}
                />
                <div>
                  <div className="font-medium">{capability.label}</div>
                  <div className="text-sm text-gray-500">{capability.description}</div>
                </div>
              </div>
            ))}
          </div>

          {agent.capabilities?.includes('webhook') && (
            <div>
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                value={agent.webhook_url || ''}
                onChange={(e) => updateAgent('webhook_url', e.target.value)}
                placeholder="https://your-api.com/webhook"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Capabilities */}
      {agent.capabilities?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((capability) => (
                <Badge key={capability} variant="secondary">
                  {capability}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}