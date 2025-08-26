import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Save, Download, Upload, Settings, Plus, Trash2, 
  MessageSquare, Bot, Database, Globe, Mail, Phone,
  GitBranch, Clock, Zap, AlertTriangle, Loader2, ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'ai_agent';
  title: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  connections: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  status: 'draft' | 'active' | 'paused';
  created_at: string;
  updated_at: string;
}

const NODE_TYPES = {
  trigger: {
    icon: Zap,
    color: 'bg-green-100 border-green-300 text-green-800',
    items: [
      { id: 'webhook', title: 'Webhook Trigger', description: 'Trigger on HTTP request' },
      { id: 'schedule', title: 'Schedule', description: 'Time-based trigger' },
      { id: 'email', title: 'Email Received', description: 'Trigger on new email' },
      { id: 'form', title: 'Form Submission', description: 'Trigger on form submit' }
    ]
  },
  action: {
    icon: Settings,
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    items: [
      { id: 'send_email', title: 'Send Email', description: 'Send email notification' },
      { id: 'api_call', title: 'API Call', description: 'Make HTTP request' },
      { id: 'database', title: 'Database Action', description: 'Create/Update/Delete data' },
      { id: 'notification', title: 'Send Notification', description: 'Push notification' }
    ]
  },
  condition: {
    icon: GitBranch,
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    items: [
      { id: 'if_then', title: 'If/Then', description: 'Conditional logic' },
      { id: 'filter', title: 'Filter', description: 'Filter data' },
      { id: 'switch', title: 'Switch', description: 'Multiple conditions' },
      { id: 'delay', title: 'Delay', description: 'Wait for time period' }
    ]
  },
  ai_agent: {
    icon: Bot,
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    items: [
      { id: 'chat_agent', title: 'Chat Agent', description: 'AI conversation' },
      { id: 'text_analysis', title: 'Text Analysis', description: 'Analyze text content' },
      { id: 'content_generation', title: 'Content Generation', description: 'Generate text content' },
      { id: 'decision_maker', title: 'Decision Maker', description: 'AI-powered decisions' }
    ]
  }
};

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      // Use demo workflows if API fails
      setWorkflows(generateDemoWorkflows());
      toast({
        title: 'Using Demo Data',
        description: 'Could not load workflows, showing demo data',
        variant: 'default'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDemoWorkflows = (): Workflow[] => {
    return [
      {
        id: 'demo-1',
        name: 'Customer Support Flow',
        description: 'Automated customer support workflow',
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            title: 'New Message',
            description: 'Trigger on new message',
            position: { x: 100, y: 100 },
            config: { event: 'message_received' },
            connections: []
          },
          {
            id: 'ai-1',
            type: 'ai_agent',
            title: 'AI Response',
            description: 'Generate AI response',
            position: { x: 300, y: 100 },
            config: { model: 'gpt-4', prompt: 'Help customer' },
            connections: []
          }
        ],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  };

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: 'New Workflow',
      description: 'Describe your workflow here',
      nodes: [],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCurrentWorkflow(newWorkflow);
    setIsCreating(true);
  };

  const saveWorkflow = async () => {
    if (!currentWorkflow) return;
    
    if (!currentWorkflow.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workflow name',
        variant: 'destructive'
      });
      return;
    }
    
    setSaving(true);
    try {
      const workflowData = {
        ...currentWorkflow,
        id: currentWorkflow.id || `workflow_${Date.now()}`,
        updated_at: new Date().toISOString()
      };
      
      if (currentWorkflow.id) {
        await apiService.updateWorkflow(currentWorkflow.id, workflowData);
      } else {
        await apiService.createWorkflow(workflowData);
      }
      
      setCurrentWorkflow(workflowData);
      await loadWorkflows();
      
      toast({
        title: 'Success',
        description: 'Workflow saved successfully'
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workflow',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (nodeType: string, nodeData: any) => {
    setDraggedNodeType(JSON.stringify({ type: nodeType, ...nodeData }));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNodeType || !currentWorkflow || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const nodeData = JSON.parse(draggedNodeType);
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeData.type,
      title: nodeData.title,
      description: nodeData.description,
      position: { x, y },
      config: {},
      connections: []
    };
    
    setCurrentWorkflow(prev => prev ? {
      ...prev,
      nodes: [...prev.nodes, newNode]
    } : null);
    
    setDraggedNodeType(null);
  }, [draggedNodeType, currentWorkflow]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const deleteNode = (nodeId: string) => {
    if (!currentWorkflow) return;
    
    setCurrentWorkflow(prev => prev ? {
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId)
    } : null);
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const updateNodeConfig = (nodeId: string, config: Record<string, any>) => {
    if (!currentWorkflow) return;
    
    setCurrentWorkflow(prev => prev ? {
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node
      )
    } : null);
  };

  const runWorkflow = async () => {
    if (!currentWorkflow) return;
    
    if (currentWorkflow.nodes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add some nodes to test the workflow',
        variant: 'destructive'
      });
      return;
    }
    
    setTesting(true);
    try {
      const testData = {
        message: 'Test message for workflow',
        user_id: 'test_user',
        timestamp: new Date().toISOString()
      };
      
      const result = await apiService.testWorkflow(currentWorkflow.id, testData);
      
      toast({
        title: 'Test Complete',
        description: `Workflow executed successfully. Result: ${result.status}`,
      });
    } catch (error) {
      console.error('Workflow test failed:', error);
      toast({
        title: 'Test Failed',
        description: 'Workflow test encountered an error',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const exportWorkflow = () => {
    if (!currentWorkflow) return;
    
    const dataStr = JSON.stringify(currentWorkflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentWorkflow.name || 'workflow'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Workflow Exported',
      description: 'Workflow has been downloaded as JSON'
    });
  };

  const loadWorkflow = (selectedWorkflow: Workflow) => {
    setCurrentWorkflow(selectedWorkflow);
    toast({
      title: 'Workflow Loaded',
      description: `Loaded ${selectedWorkflow.name}`
    });
  };

  if (!isCreating && workflows.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflow Builder</h1>
            <p className="text-muted-foreground">
              Create automated workflows with drag-and-drop simplicity
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={createNewWorkflow}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
            {workflows.length > 0 && (
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                View All Workflows
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={createNewWorkflow}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Workflow
              </CardTitle>
              <CardDescription>
                Start building your first automated workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Combine triggers, actions, and AI agents to automate your business processes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Customer Support
              </CardTitle>
              <CardDescription>Template</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Automated customer support with AI agent and escalation rules.
              </p>
              <Button variant="outline" size="sm" onClick={createNewWorkflow}>
                Use Template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Marketing
              </CardTitle>
              <CardDescription>Template</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Automated email sequences with personalization and analytics.
              </p>
              <Button variant="outline" size="sm" onClick={createNewWorkflow}>
                Use Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setIsCreating(false)}>
            ← Back
          </Button>
          <div>
            <Input 
              value={currentWorkflow?.name || ''} 
              onChange={(e) => setCurrentWorkflow(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="text-lg font-semibold border-none p-0 h-auto"
            />
            <p className="text-sm text-muted-foreground">
              {currentWorkflow?.nodes.length || 0} nodes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentWorkflow?.status === 'active' ? 'default' : 'secondary'}>
            {currentWorkflow?.status || 'draft'}
          </Badge>
          <Button variant="outline" onClick={exportWorkflow}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={runWorkflow} disabled={testing}>
            {testing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {testing ? 'Testing...' : 'Test Run'}
          </Button>
          <Button onClick={saveWorkflow} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
          <Tabs defaultValue="nodes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="nodes">Nodes</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>
            
            <TabsContent value="nodes" className="space-y-4">
              {Object.entries(NODE_TYPES).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div key={type}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </h3>
                    <div className="space-y-2">
                      {config.items.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(type, item)}
                          className={`p-3 rounded-lg border cursor-move hover:shadow-md transition-shadow ${config.color}`}
                        >
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs opacity-75">{item.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
            
            <TabsContent value="workflows" className="space-y-4">
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading workflows...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workflows.map((wf) => (
                      <Card key={wf.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => loadWorkflow(wf)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{wf.name}</h4>
                            <p className="text-sm text-muted-foreground">{wf.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={wf.status === 'active' ? 'default' : 'secondary'}>
                                {wf.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {wf.nodes.length} nodes
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {workflows.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No workflows found. Create your first workflow!
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="config" className="space-y-4">
              {selectedNode ? (
                <div>
                  <h3 className="font-semibold mb-4">{selectedNode.title}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input 
                        value={selectedNode.title}
                        onChange={(e) => {
                          const updatedNode = { ...selectedNode, title: e.target.value };
                          setSelectedNode(updatedNode);
                          updateNodeConfig(selectedNode.id, { title: e.target.value });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        value={selectedNode.description}
                        onChange={(e) => {
                          const updatedNode = { ...selectedNode, description: e.target.value };
                          setSelectedNode(updatedNode);
                          updateNodeConfig(selectedNode.id, { description: e.target.value });
                        }}
                      />
                    </div>
                    {selectedNode.type === 'ai_agent' && (
                      <div>
                        <Label>AI Model</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select AI model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                            <SelectItem value="claude">Claude</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select a node to configure</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={canvasRef}
            className="w-full h-full bg-grid-pattern relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {currentWorkflow?.nodes.map((node) => {
              const nodeType = NODE_TYPES[node.type as keyof typeof NODE_TYPES];
              const Icon = nodeType.icon;
              
              return (
                <div
                  key={node.id}
                  className={`absolute p-4 rounded-lg border-2 cursor-pointer min-w-48 ${nodeType.color} ${
                    selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium text-sm">{node.title}</div>
                        <div className="text-xs opacity-75">{node.description}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {currentWorkflow?.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Start Building Your Workflow</h3>
                  <p>Drag and drop nodes from the sidebar to create your automation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}