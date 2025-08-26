import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, Trash2, Settings, Play, Save, Download, Upload,
  MessageSquare, Bot, Zap, Database, Globe, Mail, 
  ArrowRight, ArrowDown, RotateCcw, Copy, Eye, Loader2,
  Mic, Brain, Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  parameters?: Record<string, any>;
}

interface AgentConfig {
  name: string;
  description: string;
  type: string;
  voice?: string;
  language: string;
  personality: string;
  skills: Skill[];
  knowledgeBase: string[];
  responseStyle: string;
  maxTokens: number;
  temperature: number;
}

const AVAILABLE_SKILLS: Skill[] = [
  {
    id: 'text-generation',
    name: 'Text Generation',
    description: 'Generate human-like text responses',
    category: 'Language',
    icon: 'MessageSquare'
  },
  {
    id: 'voice-synthesis',
    name: 'Voice Synthesis',
    description: 'Convert text to natural speech',
    category: 'Voice',
    icon: 'Mic'
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze emotional tone of messages',
    category: 'Analysis',
    icon: 'Brain'
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Generate and explain code snippets',
    category: 'Development',
    icon: 'Code'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze and visualize data',
    category: 'Analytics',
    icon: 'Eye'
  },
  {
    id: 'automation',
    name: 'Task Automation',
    description: 'Automate repetitive tasks',
    category: 'Productivity',
    icon: 'Zap'
  }
];

const PERSONALITY_TYPES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'creative', label: 'Creative' },
  { value: 'analytical', label: 'Analytical' }
];

const RESPONSE_STYLES = [
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'technical', label: 'Technical' },
  { value: 'creative', label: 'Creative' }
];

interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  capabilities: string[];
  knowledgeBase: Array<{
    id: string;
    name: string;
    type: string;
    content: string;
  }>;
  settings: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
  status: string;
}

export default function AgentBuilder() {
  const [agent, setAgent] = useState<Agent>({
    id: '',
    name: '',
    description: '',
    type: 'customer_support',
    capabilities: [],
    knowledgeBase: [],
    settings: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: ''
    },
    status: 'draft'
  });
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [selectedCapability, setSelectedCapability] = useState<string>('');
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTestingAgent, setIsTestingAgent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
      // Use demo agents if API fails
      setAgents(generateDemoAgents());
      toast({
        title: 'Using Demo Data',
        description: 'Could not load agents, showing demo data',
        variant: 'default'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDemoAgents = (): Agent[] => {
    return [
      {
        id: 'demo-1',
        name: 'Customer Support Agent',
        description: 'Handles customer inquiries and support requests',
        type: 'customer_support',
        capabilities: ['text_processing', 'sentiment_analysis', 'knowledge_retrieval'],
        knowledgeBase: [
          { id: '1', name: 'FAQ Document', type: 'document', content: 'Frequently asked questions...' },
          { id: '2', name: 'Product Manual', type: 'document', content: 'Product documentation...' }
        ],
        settings: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000,
          systemPrompt: 'You are a helpful customer support agent.'
        },
        status: 'active'
      }
    ];
  };

  const handleDragStart = (skill: Skill) => {
    setDraggedSkill(skill);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedSkill && !config.skills.find(s => s.id === draggedSkill.id)) {
      setConfig(prev => ({
        ...prev,
        skills: [...prev.skills, draggedSkill]
      }));
      toast({
        title: 'Skill Added',
        description: `${draggedSkill.name} has been added to your agent`
      });
    }
    setDraggedSkill(null);
  };

  const removeSkill = (skillId: string) => {
    setConfig(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== skillId)
    }));
  };

  const addKnowledgeBase = (content: string) => {
    if (content.trim()) {
      setConfig(prev => ({
        ...prev,
        knowledgeBase: [...prev.knowledgeBase, content.trim()]
      }));
    }
  };

  const removeKnowledgeBase = (index: number) => {
    setConfig(prev => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        addKnowledgeBase(`File: ${file.name}\n${content}`);
        toast({
          title: 'File Uploaded',
          description: `${file.name} has been added to knowledge base`
        });
      };
      reader.readAsText(file);
    }
  };

  const testAgent = async () => {
    if (!testMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a test message',
        variant: 'destructive'
      });
      return;
    }
    
    setIsTestingAgent(true);
    setTesting(true);
    
    try {
      const response = await apiService.sendMessage({
        message: testMessage,
        agent_id: agent.id || 'test_agent',
        conversation_id: `test_${Date.now()}`
      });
      
      setTestResponse(response.message || 'Test response received');
      
      toast({
        title: 'Test Complete',
        description: 'Agent responded successfully'
      });
    } catch (error) {
      console.error('Agent test failed:', error);
      
      // Fallback to demo response
      const responses = [
        "Hello! I'm here to help you with any questions you might have.",
        "I understand your concern. Let me help you resolve this issue.",
        "Thank you for reaching out. I'll do my best to assist you.",
        "I can help you with that. Here's what I recommend..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setTestResponse(randomResponse);
      
      toast({
        title: 'Using Demo Response',
        description: 'Agent API unavailable, showing demo response'
      });
    } finally {
      setIsTestingAgent(false);
      setTesting(false);
    }
  };

  const saveAgent = async () => {
    if (!agent.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an agent name',
        variant: 'destructive'
      });
      return;
    }
    
    setSaving(true);
    try {
      const agentData = {
        ...agent,
        id: agent.id || `agent_${Date.now()}`,
        updatedAt: new Date().toISOString()
      };
      
      if (agent.id) {
        await apiService.updateAgent(agent.id, agentData);
      } else {
        await apiService.createAgent(agentData);
      }
      
      setAgent(agentData);
      await loadAgents();
      
      toast({
        title: 'Success',
        description: 'Agent saved successfully'
      });
    } catch (error) {
      console.error('Failed to save agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to save agent',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const exportAgent = () => {
    const dataStr = JSON.stringify(agent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${agent.name || 'agent'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Agent Exported',
      description: 'Agent configuration has been downloaded as JSON'
    });
  };

  const loadAgent = (selectedAgent: Agent) => {
    setAgent(selectedAgent);
    toast({
      title: 'Agent Loaded',
      description: `Loaded ${selectedAgent.name}`
    });
  };

  const createNewAgent = () => {
    setAgent({
      id: '',
      name: '',
      description: '',
      type: 'customer_support',
      capabilities: [],
      knowledgeBase: [],
      settings: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: ''
      },
      status: 'draft'
    });
    setTestMessage('');
    setTestResponse('');
  };

  const generateTestResponse = (message: string, agentConfig: AgentConfig): string => {
    const responses = {
      professional: "Thank you for your inquiry. I'll be happy to assist you with that.",
      friendly: "Hi there! I'd love to help you out with that question!",
      casual: "Hey! Sure thing, let me help you with that.",
      formal: "I acknowledge your request and shall provide assistance accordingly.",
      creative: "What an interesting question! Let me think creatively about this...",
      analytical: "Let me analyze your request and provide a structured response."
    };
    
    const baseResponse = responses[agentConfig.personality as keyof typeof responses] || responses.professional;
    
    if (agentConfig.skills.some(s => s.id === 'sentiment-analysis')) {
      return `${baseResponse} I can sense you're looking for information, and I'm here to help!`;
    }
    
    if (agentConfig.skills.some(s => s.id === 'code-generation')) {
      return `${baseResponse} If you need any code examples or technical explanations, I can generate those for you.`;
    }
    
    return `${baseResponse} Based on my configuration, I can help with: ${agentConfig.skills.map(s => s.name).join(', ')}.`;
  };

  const getSkillIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      MessageSquare: <MessageSquare className="h-4 w-4" />,
      Mic: <Mic className="h-4 w-4" />,
      Brain: <Brain className="h-4 w-4" />,
      Code: <Code className="h-4 w-4" />,
      Eye: <Eye className="h-4 w-4" />,
      Zap: <Zap className="h-4 w-4" />
    };
    return icons[iconName] || <Bot className="h-4 w-4" />;
  };

  return (
    <div className="h-full flex gap-6">
      {/* Skills Library */}
      <Card className="w-80 flex-shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Skills Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {AVAILABLE_SKILLS.map((skill) => (
                <Card
                  key={skill.id}
                  className="p-3 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(skill)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getSkillIcon(skill.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{skill.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {skill.category}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Agent Builder */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agent Builder</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportConfig}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={saveAgent} disabled={isBuilding}>
                <Save className="h-4 w-4 mr-2" />
                {isBuilding ? 'Creating...' : 'Create Agent'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Agent Builder</h2>
              <p className="text-muted-foreground">Create and configure AI agents</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={createNewAgent}>
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
              <Button variant="outline" onClick={exportAgent}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={saveAgent} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="basic" className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              <TabsTrigger value="test">Test Agent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={agent.name}
                    onChange={(e) => setAgent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter agent name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Agent Type</Label>
                  <Select value={agent.type} onValueChange={(value) => setAgent(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_support">Customer Support</SelectItem>
                      <SelectItem value="sales_assistant">Sales Assistant</SelectItem>
                      <SelectItem value="content_creator">Content Creator</SelectItem>
                      <SelectItem value="data_analyst">Data Analyst</SelectItem>
                      <SelectItem value="personal_assistant">Personal Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={agent.description}
                  onChange={(e) => setAgent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your agent does"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={agent.settings.model} onValueChange={(value) => setAgent(prev => ({ ...prev, settings: { ...prev.settings, model: value } }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={agent.settings.maxTokens}
                    onChange={(e) => setAgent(prev => ({ ...prev, settings: { ...prev.settings, maxTokens: parseInt(e.target.value) || 1000 } }))}
                    min={100}
                    max={4000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={agent.settings.temperature}
                    onChange={(e) => setAgent(prev => ({ ...prev, settings: { ...prev.settings, temperature: parseFloat(e.target.value) || 0.7 } }))}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={agent.settings.systemPrompt}
                  onChange={(e) => setAgent(prev => ({ ...prev, settings: { ...prev.settings, systemPrompt: e.target.value } }))}
                  placeholder="Define the agent's role and behavior"
                  rows={4}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="agents" className="mt-6">
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading agents...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agents.map((ag) => (
                      <Card key={ag.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => loadAgent(ag)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{ag.name}</h4>
                            <p className="text-sm text-muted-foreground">{ag.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={ag.status === 'active' ? 'default' : 'secondary'}>
                                {ag.status}
                              </Badge>
                              <Badge variant="outline">
                                {ag.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {ag.capabilities.length} capabilities
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {agents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No agents found. Create your first agent!
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="skills" className="mt-6">
              <div
                className="min-h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg p-6"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="text-center mb-6">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Drag skills from the library to add them to your agent
                  </p>
                </div>
                
                {config.skills.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {config.skills.map((skill) => (
                      <Card key={skill.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getSkillIcon(skill.icon)}
                            </div>
                            <div>
                              <h4 className="font-medium">{skill.name}</h4>
                              <p className="text-sm text-muted-foreground">{skill.description}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="knowledge" className="space-y-4 mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {config.knowledgeBase.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {item.length > 200 ? `${item.substring(0, 200)}...` : item}
                          </pre>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKnowledgeBase(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  
                  {config.knowledgeBase.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No knowledge base items added yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testMessage">Test Message</Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter a message to test your agent"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={testAgent}
                  disabled={isTestingAgent || testing || !testMessage.trim()}
                  className="w-full"
                >
                  {isTestingAgent || testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Test Agent
                    </>
                  )}
                </Button>
                
                {testResponse && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Agent Response:</h4>
                      <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(testResponse)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{testResponse}</p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}