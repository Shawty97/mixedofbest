
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import useWorkflowStore from './store/workflowStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkflowMetricsProps {
  workflowId: string;
}

export function WorkflowMetrics({ workflowId }: WorkflowMetricsProps) {
  const [metrics, setMetrics] = useState({
    successRate: 0,
    averageExecutionTime: 0,
    costEfficiency: 0,
    tokenUtilization: 0,
  });
  
  const [statusBadge, setStatusBadge] = useState<{
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }>({
    text: 'Idle',
    variant: 'outline',
  });
  
  const [historyData, setHistoryData] = useState<any[]>([]);
  
  const { getWorkflowAnalytics } = useWorkflowStore();
  const workflows = useWorkflowStore(state => state.workflows);
  
  useEffect(() => {
    if (!workflowId) return;
    
    // Get the current workflow performance data
    const workflowAnalytics = getWorkflowAnalytics(workflowId);
    setMetrics(workflowAnalytics);
    
    // Find the workflow to get its status
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (workflow && workflow.performance) {
      // Set the right badge based on status
      switch(workflow.performance.status) {
        case 'running':
          setStatusBadge({ text: 'Running', variant: 'default' });
          break;
        case 'success':
          setStatusBadge({ text: 'Success', variant: 'default' });
          break;
        case 'error':
          setStatusBadge({ text: 'Failed', variant: 'destructive' });
          break;
        default:
          setStatusBadge({ text: 'Idle', variant: 'outline' });
      }
      
      // Generate some mock history data if it's not available
      // Fixed: Changed totalExecutions to use totalExecutionTime for the check
      const executionsCount = workflow.performance.totalExecutionTime ? 5 : 0; // If there's execution time, assume there were executions
      const mockHistoryData = generateHistoryData(executionsCount);
      setHistoryData(mockHistoryData);
    }
  }, [workflowId, workflows, getWorkflowAnalytics]);
  
  // Function to generate mock history data
  const generateHistoryData = (executions: number) => {
    if (executions === 0) return [];
    
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < Math.min(executions, 5); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        executionTime: Math.floor(Math.random() * 1000) + 500, // 500-1500ms
        tokens: Math.floor(Math.random() * 500) + 100, // 100-600 tokens
        cost: Number((Math.random() * 0.02 + 0.01).toFixed(4)), // $0.01-0.03
      });
    }
    
    return data.reverse();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Workflow Performance</h4>
        <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Success Rate</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{metrics.successRate.toFixed(0)}%</div>
              <Progress value={metrics.successRate} className="h-2 w-16" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Avg. Execution</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{metrics.averageExecutionTime.toFixed(0)}<span className="text-xs font-normal ml-1">ms</span></div>
              <Progress value={Math.min(100, metrics.averageExecutionTime / 20)} className="h-2 w-16" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Token Usage</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{metrics.tokenUtilization.toFixed(0)}<span className="text-xs font-normal ml-1">tokens</span></div>
              <Progress value={Math.min(100, metrics.tokenUtilization / 10)} className="h-2 w-16" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Cost Efficiency</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">${metrics.costEfficiency.toFixed(4)}</div>
              <Progress 
                value={metrics.costEfficiency > 0 ? Math.min(100, (1 - metrics.costEfficiency / 0.05) * 100) : 0} 
                className="h-2 w-16" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {historyData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h5 className="text-xs font-medium text-muted-foreground mb-4">Execution History</h5>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="executionTime" name="Execution Time (ms)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
