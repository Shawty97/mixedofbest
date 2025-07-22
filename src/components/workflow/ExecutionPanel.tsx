
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, AlertCircle, Loader2, CheckCircle, XCircle, BarChart3, Terminal } from "lucide-react";
import { SavedWorkflow } from './store/workflowStore';
import { useWorkflowExecution } from '@/hooks/use-workflow-execution';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ExecutionPanelProps {
  workflow: SavedWorkflow;
}

export function ExecutionPanel({ workflow }: ExecutionPanelProps) {
  const {
    executeWorkflow,
    cancelExecution,
    isExecuting,
    executionResult,
    error,
    progress,
    executionLogs
  } = useWorkflowExecution();

  const [activeTab, setActiveTab] = useState('execution');

  const handleExecute = async () => {
    await executeWorkflow(workflow);
  };

  const handleCancel = () => {
    cancelExecution();
  };

  // Get status display
  const getStatusDisplay = () => {
    if (isExecuting) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        color: "text-blue-600",
        badge: "running"
      };
    }
    
    if (executionResult) {
      switch (executionResult.status) {
        case 'completed':
          return {
            icon: <CheckCircle className="h-4 w-4" />,
            color: "text-green-600",
            badge: "completed"
          };
        case 'failed':
          return {
            icon: <XCircle className="h-4 w-4" />,
            color: "text-red-600",
            badge: "failed"
          };
        case 'cancelled':
          return {
            icon: <Square className="h-4 w-4" />,
            color: "text-gray-600",
            badge: "cancelled"
          };
      }
    }
    
    return null;
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">Workflow Execution</h3>
          {statusDisplay && (
            <div className={`flex items-center gap-1 ${statusDisplay.color}`}>
              {statusDisplay.icon}
              <Badge variant="outline" className={statusDisplay.color}>
                {statusDisplay.badge}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isExecuting ? (
            <Button onClick={handleCancel} variant="destructive" size="sm">
              <Square className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          ) : (
            <Button onClick={handleExecute} size="sm">
              <Play className="h-4 w-4 mr-1" />
              Execute
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="execution">Status</TabsTrigger>
          <TabsTrigger value="logs">
            <Terminal className="h-4 w-4 mr-1" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="performance" disabled={!executionResult}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="execution" className="space-y-4 mt-4">
          {/* Progress Bar */}
          {(isExecuting || progress.total > 0) && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress.completed}/{progress.total} nodes</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          )}

          {/* Currently Running Nodes */}
          {progress.currentNodes.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Currently Running:</div>
              <div className="flex flex-wrap gap-1">
                {progress.currentNodes.map(nodeId => (
                  <Badge key={nodeId} variant="secondary" className="text-xs animate-pulse">
                    {nodeId}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
              <div className="flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Execution Error</span>
              </div>
              <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <ScrollArea className="h-48 w-full border rounded p-2 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-1">
              {executionLogs.length > 0 ? (
                executionLogs.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-gray-700 dark:text-gray-300">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No logs available</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          {executionResult && (
            <div className="space-y-4">
              {/* Execution Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Duration</div>
                  <div className="font-medium">
                    {(executionResult.totalDuration / 1000).toFixed(2)}s
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Success Rate</div>
                  <div className="font-medium">
                    {Math.round((executionResult.metadata.completedNodes / executionResult.metadata.totalNodes) * 100)}%
                  </div>
                </div>
                {executionResult.metadata.totalTokens && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Tokens</div>
                    <div className="font-medium">
                      {executionResult.metadata.totalTokens.toLocaleString()}
                    </div>
                  </div>
                )}
                {executionResult.metadata.totalCost && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Cost</div>
                    <div className="font-medium">
                      ${executionResult.metadata.totalCost.toFixed(4)}
                    </div>
                  </div>
                )}
              </div>

              {/* Final Output */}
              {executionResult.finalOutput && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Final Output:</h4>
                  <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded text-sm font-mono max-h-32 overflow-y-auto">
                    {typeof executionResult.finalOutput === 'object' 
                      ? JSON.stringify(executionResult.finalOutput, null, 2)
                      : String(executionResult.finalOutput)
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
