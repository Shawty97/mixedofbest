import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, MessageSquare, Clock } from "lucide-react";

const AgentMonitoring = () => {
  const metrics = [
    { label: "Active Conversations", value: "247", icon: MessageSquare, change: "+12%" },
    { label: "Total Users", value: "1,284", icon: Users, change: "+8%" },
    { label: "Avg Response Time", value: "1.2s", icon: Clock, change: "-15%" },
    { label: "System Health", value: "99.8%", icon: Activity, change: "+0.1%" }
  ];

  const agents = [
    { name: "Customer Support", status: "healthy", load: 78, conversations: 42 },
    { name: "Sales Assistant", status: "warning", load: 92, conversations: 28 },
    { name: "Technical Helper", status: "healthy", load: 65, conversations: 15 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Monitoring</h1>
        <p className="text-muted-foreground">Real-time performance and health monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span> from last hour
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {agents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={agent.status === 'healthy' ? 'default' : 'destructive'}>
                        {agent.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {agent.conversations} active conversations
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 min-w-[200px]">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Load</span>
                      <span>{agent.load}%</span>
                    </div>
                    <Progress value={agent.load} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentMonitoring;