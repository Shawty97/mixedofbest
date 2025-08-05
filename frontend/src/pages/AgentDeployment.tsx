import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Settings, Globe } from "lucide-react";

const AgentDeployment = () => {
  const deployments = [
    {
      id: "1",
      name: "Customer Support Agent",
      status: "active",
      environment: "production",
      region: "us-east-1",
      instances: 3,
      uptime: "99.9%"
    },
    {
      id: "2", 
      name: "Sales Assistant",
      status: "stopped",
      environment: "staging", 
      region: "eu-west-1",
      instances: 1,
      uptime: "95.2%"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agent Deployment</h1>
          <p className="text-muted-foreground">Deploy and manage your agents across environments</p>
        </div>
        <Button>
          <Play className="w-4 h-4 mr-2" />
          Deploy New Agent
        </Button>
      </div>

      <div className="grid gap-6">
        {deployments.map((deployment) => (
          <Card key={deployment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{deployment.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={deployment.status === 'active' ? 'default' : 'secondary'}>
                      {deployment.status}
                    </Badge>
                    <Badge variant="outline">{deployment.environment}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Globe className="w-4 h-4" />
                  </Button>
                  {deployment.status === 'active' ? (
                    <Button variant="outline" size="sm">
                      <Square className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Region:</span>
                  <p className="font-medium">{deployment.region}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Instances:</span>
                  <p className="font-medium">{deployment.instances}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Uptime:</span>
                  <p className="font-medium">{deployment.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentDeployment;