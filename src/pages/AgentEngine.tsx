import React, { useState, useEffect } from 'react';
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Cpu, 
  Memory, 
  HardDrive,
  Network
} from "lucide-react";

const AgentEngine = () => {
  const [runningAgents, setRunningAgents] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    storage: 38,
    network: 23
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Agent Engine</h1>
            <p className="text-muted-foreground">Runtime system that interprets agent configs and executes calls</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Healthy
          </Badge>
        </div>

        <Tabs defaultValue="running" className="space-y-4">
          <TabsList>
            <TabsTrigger value="running">Running Agents</TabsTrigger>
            <TabsTrigger value="metrics">System Metrics</TabsTrigger>
            <TabsTrigger value="config">Engine Config</TabsTrigger>
          </TabsList>

          <TabsContent value="running" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Active Agent Instances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Agent instance cards */}
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Customer Support Assistant</p>
                          <p className="text-sm text-muted-foreground">agent_001 • Running for 2h 34m</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">LiveKit</Badge>
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.cpu}%</div>
                  <div className="h-2 bg-secondary rounded-full mt-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${systemMetrics.cpu}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory</CardTitle>
                  <Memory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.memory}%</div>
                  <div className="h-2 bg-secondary rounded-full mt-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${systemMetrics.memory}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.storage}%</div>
                  <div className="h-2 bg-secondary rounded-full mt-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${systemMetrics.storage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.network}%</div>
                  <div className="h-2 bg-secondary rounded-full mt-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${systemMetrics.network}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AgentEngine;