import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Workflow, Database, Zap } from 'lucide-react';

const CorePlatform: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Core Platform</h1>
        <p className="text-muted-foreground">
          AI Workflow Creator with DAG orchestration and intelligent automation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Workflow Designer
            </CardTitle>
            <CardDescription>
              Visual DAG-based workflow creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create Workflow</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Sources
            </CardTitle>
            <CardDescription>
              Connect and manage data inputs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Manage Sources</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Execution Engine
            </CardTitle>
            <CardDescription>
              High-performance workflow execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Monitor</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CorePlatform;