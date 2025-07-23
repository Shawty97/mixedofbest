import { useState, useEffect } from 'react';
import { Plus, Play, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentBuilder } from '@/components/studio/AgentBuilder';
import { AgentTester } from '@/components/studio/AgentTester';
import { useAgentStore } from '@/hooks/useAgentStore';

export default function Studio() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const { agents, createAgent, updateAgent, testAgent } = useAgentStore();

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Agent List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Voice Agents</h2>
            <Button size="sm" onClick={() => createAgent()}>
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {agents.map((agent) => (
            <Card 
              key={agent.id}
              className={`cursor-pointer transition-colors ${
                selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedAgent(agent)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost">
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <Tabs defaultValue="builder" className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="builder">Builder</TabsTrigger>
                  <TabsTrigger value="test">Test</TabsTrigger>
                  <TabsTrigger value="deploy">Deploy</TabsTrigger>
                </TabsList>
                <Button onClick={() => updateAgent(selectedAgent)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Agent
                </Button>
              </div>
            </div>

            <TabsContent value="builder" className="flex-1 p-6">
              <AgentBuilder 
                agent={selectedAgent} 
                onChange={setSelectedAgent}
              />
            </TabsContent>

            <TabsContent value="test" className="flex-1 p-6">
              <AgentTester agent={selectedAgent} />
            </TabsContent>

            <TabsContent value="deploy" className="flex-1 p-6">
              <div className="text-center text-gray-500">
                Deployment configuration coming soon...
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select an agent to start building
              </h3>
              <p className="text-gray-500 mb-4">
                Choose an agent from the sidebar or create a new one
              </p>
              <Button onClick={() => createAgent()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Agent
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}