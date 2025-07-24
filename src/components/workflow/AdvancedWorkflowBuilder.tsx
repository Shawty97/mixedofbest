import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Stop, 
  Settings, 
  Plus,
  Workflow,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'error';
  lastRun: string;
  nextRun?: string;
  description: string;
}

export const AdvancedWorkflowBuilder: React.FC = () => {
  const [workflows] = useState<WorkflowStatus[]>([
    {
      id: '1',
      name: 'Customer Onboarding',
      status: 'running',
      lastRun: '2 minutes ago',
      nextRun: 'In 1 hour',
      description: 'Automated customer onboarding workflow with email sequences'
    },
    {
      id: '2', 
      name: 'Data Processing Pipeline',
      status: 'completed',
      lastRun: '5 minutes ago',
      nextRun: 'Tomorrow at 9:00 AM',
      description: 'Daily data processing and analytics generation'
    },
    {
      id: '3',
      name: 'Lead Qualification',
      status: 'paused',
      lastRun: '1 hour ago',
      description: 'Automated lead scoring and qualification process'
    }
  ]);

  const getStatusIcon = (status: WorkflowStatus['status']) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'stopped':
        return <Stop className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: WorkflowStatus['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Workflow Management</h2>
          <p className="text-muted-foreground">
            Build, deploy, and monitor automated workflows
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Workflow className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <Badge className={getStatusColor(workflow.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(workflow.status)}
                      <span className="capitalize">{workflow.status}</span>
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={workflow.status === 'running' ? 'destructive' : 'default'} 
                    size="sm"
                  >
                    {workflow.status === 'running' ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span>Last run: {workflow.lastRun}</span>
                  {workflow.nextRun && (
                    <span>Next run: {workflow.nextRun}</span>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};