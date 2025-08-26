import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Plus,
  Workflow,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiService, Workflow as WorkflowType } from '@/services/apiService';

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'error' | 'active' | 'pending';
  lastRun: string;
  nextRun?: string;
  description: string;
}

export const AdvancedWorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const workflowData = await apiService.getWorkflows();
        setWorkflows(workflowData);
        setError(null);
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError('Failed to load workflows');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'paused':
      case 'pending':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
      case 'pending':
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
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
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading workflows...</div>
        </div>
      </div>
    );
  }

  if (error) {
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
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

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
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first workflow to automate your processes
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow._id || workflow.workflow_id}>
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
                      variant={workflow.status === 'running' || workflow.status === 'active' ? 'destructive' : 'default'} 
                      size="sm"
                    >
                      {workflow.status === 'running' || workflow.status === 'active' ? (
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
                <CardDescription>{workflow.description || 'No description available'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span>Created: {formatDate(workflow.created_at)}</span>
                    <span>Type: {workflow.type}</span>
                    <span>Steps: {workflow.steps?.length || 0}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};