import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UniversalAgentDefinition, UniversalAgentManager } from '@/schemas/universalAgent';
import { UniversalAgentService } from '@/services/universalAgentService';
import { useToast } from '@/hooks/use-toast';
import { Cpu, Brain, Zap, Shield, Cloud, Download, Upload, Copy } from 'lucide-react';

interface UniversalAgentBuilderProps {
  agentId?: string;
  onSave?: (agent: UniversalAgentDefinition) => void;
}

export function UniversalAgentBuilder({ agentId, onSave }: UniversalAgentBuilderProps) {
  const [definition, setDefinition] = useState<UniversalAgentDefinition>(
    UniversalAgentManager.generateTemplate('voice')
  );
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (agentId) {
      loadAgent(agentId);
    }
  }, [agentId]);

  const loadAgent = async (id: string) => {
    try {
      setLoading(true);
      const agent = await UniversalAgentService.getById(id);
      if (agent) {
        setDefinition(agent.definition);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load agent: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateAndUpdate = (newDefinition: UniversalAgentDefinition) => {
    const validation = UniversalAgentManager.validateDefinition(newDefinition);
    setValidationErrors(validation.errors || []);
    setDefinition(newDefinition);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (agentId) {
        await UniversalAgentService.update(agentId, definition);
        toast({ title: "Success", description: "Agent updated successfully!" });
      } else {
        await UniversalAgentService.create(definition);
        toast({ title: "Success", description: "Agent created successfully!" });
      }
      
      onSave?.(definition);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save agent: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportYAML = async () => {
    try {
      const yaml = UniversalAgentManager.toYAML(definition);
      const blob = new Blob([yaml], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${definition.name.toLowerCase().replace(/\s+/g, '-')}.yaml`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Agent exported as YAML!" });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to export: ${error}`,
        variant: "destructive"
      });
    }
  };

  const handleImportYAML = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const yamlContent = e.target?.result as string;
        const imported = UniversalAgentManager.fromYAML(yamlContent);
        validateAndUpdate(imported);
        toast({ title: "Success", description: "Agent imported from YAML!" });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to import: ${error}`,
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const updateDefinition = (path: string, value: any) => {
    const newDefinition = { ...definition };
    const keys = path.split('.');
    let current = newDefinition as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    newDefinition.metadata.updated_at = new Date().toISOString();
    
    validateAndUpdate(newDefinition);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Universal Agent Builder
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create cross-platform AI agents with the Universal Agent Metamodel
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportYAML}>
              <Download className="h-4 w-4 mr-2" />
              Export YAML
            </Button>
            <label>
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import YAML
                </span>
              </Button>
              <input
                type="file"
                accept=".yaml,.yml"
                onChange={handleImportYAML}
                className="hidden"
              />
            </label>
            <Button onClick={handleSave} disabled={loading || validationErrors.length > 0}>
              {loading ? "Saving..." : "Save Agent"}
            </Button>
          </div>
        </CardHeader>
        {validationErrors.length > 0 && (
          <CardContent>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-semibold text-destructive mb-2">Validation Errors:</h4>
              <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Configuration */}
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="persona">Persona</TabsTrigger>
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        {/* Identity Tab */}
        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Agent Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={definition.name}
                    onChange={(e) => updateDefinition('name', e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={definition.category} onValueChange={(value) => updateDefinition('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voice">Voice Agent</SelectItem>
                      <SelectItem value="chat">Chat Agent</SelectItem>
                      <SelectItem value="multimodal">Multimodal Agent</SelectItem>
                      <SelectItem value="workflow">Workflow Agent</SelectItem>
                      <SelectItem value="autonomous">Autonomous Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={definition.description || ''}
                  onChange={(e) => updateDefinition('description', e.target.value)}
                  placeholder="Describe what this agent does"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={definition.version}
                    onChange={(e) => updateDefinition('version', e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="id">Agent ID</Label>
                  <Input
                    id="id"
                    value={definition.id}
                    onChange={(e) => updateDefinition('id', e.target.value)}
                    placeholder="unique-agent-id"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Persona Tab */}
        <TabsContent value="persona">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Agent Persona & Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="personality">Personality</Label>
                <Textarea
                  id="personality"
                  value={definition.persona.personality}
                  onChange={(e) => updateDefinition('persona.personality', e.target.value)}
                  placeholder="Describe the agent's personality"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tone">Communication Tone</Label>
                <Select 
                  value={definition.persona.tone} 
                  onValueChange={(value) => updateDefinition('persona.tone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="instructions">Core Instructions</Label>
                <Textarea
                  id="instructions"
                  value={definition.persona.instructions}
                  onChange={(e) => updateDefinition('persona.instructions', e.target.value)}
                  placeholder="Detailed instructions for how the agent should behave"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="greeting">Greeting Message</Label>
                  <Input
                    id="greeting"
                    value={definition.persona.greeting || ''}
                    onChange={(e) => updateDefinition('persona.greeting', e.target.value)}
                    placeholder="Hello! How can I help you?"
                  />
                </div>
                <div>
                  <Label htmlFor="ending">Ending Message</Label>
                  <Input
                    id="ending"
                    value={definition.persona.ending_message || ''}
                    onChange={(e) => updateDefinition('persona.ending_message', e.target.value)}
                    placeholder="Thank you for using our service!"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select 
                    value={definition.ai_config.provider} 
                    onValueChange={(value) => updateDefinition('ai_config.provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="azure">Azure OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={definition.ai_config.model}
                    onChange={(e) => updateDefinition('ai_config.model', e.target.value)}
                    placeholder="gpt-4, claude-3-opus, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature ({definition.ai_config.temperature || 0.7})</Label>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={definition.ai_config.temperature || 0.7}
                    onChange={(e) => updateDefinition('ai_config.temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={definition.ai_config.max_tokens || 1000}
                    onChange={(e) => updateDefinition('ai_config.max_tokens', parseInt(e.target.value))}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={definition.ai_config.system_prompt || ''}
                  onChange={(e) => updateDefinition('ai_config.system_prompt', e.target.value)}
                  placeholder="Optional system prompt for the AI model"
                  rows={3}
                />
              </div>

              {/* Voice Configuration for voice agents */}
              {definition.category === 'voice' && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Voice Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tts_provider">TTS Provider</Label>
                      <Select 
                        value={definition.voice_config?.tts_provider || 'elevenlabs'} 
                        onValueChange={(value) => updateDefinition('voice_config.tts_provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="azure">Azure</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stt_provider">STT Provider</Label>
                      <Select 
                        value={definition.voice_config?.stt_provider || 'openai'} 
                        onValueChange={(value) => updateDefinition('voice_config.stt_provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="deepgram">Deepgram</SelectItem>
                          <SelectItem value="azure">Azure</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Agent Capabilities & Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Current Capabilities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {definition.capabilities.map((cap, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {cap.quantum_enhanced && <Zap className="h-3 w-3 text-yellow-500" />}
                        {cap.name}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newCaps = definition.capabilities.filter((_, i) => i !== index);
                            updateDefinition('capabilities', newCaps);
                          }}
                          className="h-4 w-4 p-0 ml-1"
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Capabilities and tools will be managed through the enhanced capability builder coming in Phase 2.
                  This includes quantum-enhanced capabilities, custom tools, and marketplace integrations.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="access_level">Access Level</Label>
                <Select 
                  value={definition.security.access_level} 
                  onValueChange={(value) => updateDefinition('security.access_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate_limit_per_minute">Rate Limit (per minute)</Label>
                  <Input
                    id="rate_limit_per_minute"
                    type="number"
                    value={definition.security.rate_limits?.requests_per_minute || 60}
                    onChange={(e) => updateDefinition('security.rate_limits.requests_per_minute', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="concurrent_sessions">Concurrent Sessions</Label>
                  <Input
                    id="concurrent_sessions"
                    type="number"
                    value={definition.security.rate_limits?.concurrent_sessions || 10}
                    onChange={(e) => updateDefinition('security.rate_limits.concurrent_sessions', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Advanced security features including compliance frameworks, audit logging, 
                and enterprise security controls will be available in Phase 5.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Tab */}
        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Deployment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Target Environments</Label>
                <div className="flex gap-2 mt-2">
                  {['development', 'staging', 'production'].map((env) => (
                    <Badge 
                      key={env}
                      variant={definition.deployment.environments.includes(env as any) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const envs = definition.deployment.environments;
                        const newEnvs = envs.includes(env as any) 
                          ? envs.filter(e => e !== env)
                          : [...envs, env as any];
                        updateDefinition('deployment.environments', newEnvs);
                      }}
                    >
                      {env}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="min_instances">Min Instances</Label>
                  <Input
                    id="min_instances"
                    type="number"
                    value={definition.deployment.scaling.min_instances}
                    onChange={(e) => updateDefinition('deployment.scaling.min_instances', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_instances">Max Instances</Label>
                  <Input
                    id="max_instances"
                    type="number"
                    value={definition.deployment.scaling.max_instances}
                    onChange={(e) => updateDefinition('deployment.scaling.max_instances', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="auto_scale"
                    checked={definition.deployment.scaling.auto_scale}
                    onChange={(e) => updateDefinition('deployment.scaling.auto_scale', e.target.checked)}
                  />
                  <Label htmlFor="auto_scale">Auto Scale</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpu_limit">CPU Limit</Label>
                  <Input
                    id="cpu_limit"
                    value={definition.deployment.resources.cpu_limit || ''}
                    onChange={(e) => updateDefinition('deployment.resources.cpu_limit', e.target.value)}
                    placeholder="500m"
                  />
                </div>
                <div>
                  <Label htmlFor="memory_limit">Memory Limit</Label>
                  <Input
                    id="memory_limit"
                    value={definition.deployment.resources.memory_limit || ''}
                    onChange={(e) => updateDefinition('deployment.resources.memory_limit', e.target.value)}
                    placeholder="1Gi"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="gpu_required"
                    checked={definition.deployment.resources.gpu_required || false}
                    onChange={(e) => updateDefinition('deployment.resources.gpu_required', e.target.checked)}
                  />
                  <Label htmlFor="gpu_required">GPU Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="quantum_compute"
                    checked={definition.deployment.resources.quantum_compute || false}
                    onChange={(e) => updateDefinition('deployment.resources.quantum_compute', e.target.checked)}
                  />
                  <Label htmlFor="quantum_compute" className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    Quantum Compute
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}