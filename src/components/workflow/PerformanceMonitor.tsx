
import React from 'react';
import { PerformanceDashboard } from './PerformanceDashboard';
import { WorkflowMetrics } from './WorkflowMetrics';
import { SavedWorkflow } from './store/workflowStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp } from 'lucide-react';

interface PerformanceMonitorProps {
  workflow: SavedWorkflow;
  executionId?: string;
}

export function PerformanceMonitor({ workflow, executionId }: PerformanceMonitorProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="metrics">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">
            <TrendingUp className="h-4 w-4 mr-1" />
            Workflow Metrics
          </TabsTrigger>
          <TabsTrigger value="realtime" disabled={!executionId}>
            <Activity className="h-4 w-4 mr-1" />
            Real-time Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <WorkflowMetrics workflowId={workflow.id} />
        </TabsContent>

        <TabsContent value="realtime">
          {executionId ? (
            <PerformanceDashboard executionId={executionId} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Start a workflow execution to see real-time performance analytics
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
