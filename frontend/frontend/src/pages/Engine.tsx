import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, RotateCcw, Activity, Phone, PhoneOff } from 'lucide-react';

interface AgentInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  uptime: string;
  callsHandled: number;
  lastActivity: string;
  liveKitRoom?: string;
}

interface CallSession {
  id: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'completed' | 'failed';
  startTime: string;
  duration?: string;
  phoneNumber?: string;
}

export default function Engine() {
  const [agents, setAgents] = useState<AgentInstance[]>([
    {
      id: 'agent-1',
      name: 'Customer Support Agent',
      status: 'running',
      uptime: '2h 34m',
      callsHandled: 12,
      lastActivity: '2 minutes ago',
      liveKitRoom: 'room-cs-001'
    },
    {
      id: 'agent-2',
      name: 'Sales Assistant',
      status: 'stopped',
      uptime: '0m',
      callsHandled: 0,
      lastActivity: 'Never',
    }
  ]);

  const [activeCalls, setActiveCalls] = useState<CallSession[]>([
    {
      id: 'call-1',
      agentId: 'agent-1',
      agentName: 'Customer Support Agent',
      status: 'active',
      startTime: '14:32',
      phoneNumber: '+1 (555) 123-4567'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'starting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStartAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'starting' as const }
        : agent
    ));
    
    // Simulate startup
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'running' as const, uptime: '0m' }
          : agent
      ));
    }, 2000);
  };

  const handleStopAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'stopped' as const, uptime: '0m' }
        : agent
    ));
  };

  const handleRestartAgent = (agentId: string) => {
    handleStopAgent(agentId);
    setTimeout(() => handleStartAgent(agentId), 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Engine</h1>
          <p className="text-muted-foreground">
            Manage and monitor your voice agents in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {agents.filter(a => a.status === 'running').length} Active
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="instances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="instances">Agent Instances</TabsTrigger>
          <TabsTrigger value="calls">Active Calls</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="instances" className="space-y-4">
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription>ID: {agent.id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.status === 'running' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestartAgent(agent.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStopAgent(agent.id)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartAgent(agent.id)}
                        disabled={agent.status === 'starting'}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{agent.status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{agent.uptime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Calls Handled</p>
                      <p className="font-medium">{agent.callsHandled}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Activity</p>
                      <p className="font-medium">{agent.lastActivity}</p>
                    </div>
                  </div>
                  {agent.liveKitRoom && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        LiveKit Room: <code className="bg-muted px-1 rounded">{agent.liveKitRoom}</code>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <div className="grid gap-4">
            {activeCalls.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <PhoneOff className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No active calls</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              activeCalls.map((call) => (
                <Card key={call.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-500" />
                      <div>
                        <CardTitle className="text-lg">{call.agentName}</CardTitle>
                        <CardDescription>{call.phoneNumber}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={call.status === 'active' ? 'default' : 'secondary'}>
                      {call.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start Time</p>
                        <p className="font-medium">{call.startTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{call.duration || 'Ongoing'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Call ID</p>
                        <p className="font-medium font-mono text-xs">{call.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Real-time agent and system activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                <div>[14:35:22] Agent customer-support-agent started successfully</div>
                <div>[14:35:23] LiveKit room room-cs-001 created</div>
                <div>[14:32:15] Incoming call from +1 (555) 123-4567</div>
                <div>[14:32:16] Call routed to customer-support-agent</div>
                <div>[14:32:17] Azure STT initialized</div>
                <div>[14:32:18] OpenAI LLM ready</div>
                <div>[14:32:19] Azure TTS initialized</div>
                <div>[14:32:20] Call session established</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}