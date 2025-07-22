
import { useState, useCallback, useRef, useEffect } from 'react';
import { workflowExecutor, WorkflowExecutionResult } from '@/services/dag-engine/WorkflowExecutor';
import { dagEngine } from '@/services/dag-engine/DAGEngine';
import { SavedWorkflow } from '@/components/workflow/store/workflowStore';
import { toast } from './use-toast';

export interface UseWorkflowExecutionReturn {
  executeWorkflow: (workflow: SavedWorkflow) => Promise<void>;
  cancelExecution: () => void;
  isExecuting: boolean;
  executionResult: WorkflowExecutionResult | null;
  error: string | null;
  progress: {
    completed: number;
    total: number;
    percentage: number;
    currentNodes: string[];
  };
  executionLogs: string[];
}

export function useWorkflowExecution(): UseWorkflowExecutionReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
    currentNodes: [] as string[]
  });
  const [executionLogs, setExecutionLogs] = useState<string[]>();
  const currentExecutionId = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const addLog = useCallback((message: string) => {
    setExecutionLogs(prev => [...(prev || []), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Execute workflow
  const executeWorkflow = useCallback(async (workflow: SavedWorkflow) => {
    if (isExecuting) {
      toast({
        title: "Execution in progress",
        description: "Please wait for the current execution to complete",
        variant: "destructive"
      });
      return;
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      toast({
        title: "Empty workflow",
        description: "Please add some nodes to your workflow before executing",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setError(null);
    setExecutionResult(null);
    setExecutionLogs([]);
    setProgress({ completed: 0, total: workflow.nodes.length, percentage: 0, currentNodes: [] });

    addLog(`Starting execution of workflow: ${workflow.name}`);
    addLog(`Total nodes to process: ${workflow.nodes.length}`);

    try {
      // Create DAG execution
      const dagExecution = dagEngine.createDAG(workflow);
      currentExecutionId.current = dagExecution.id;

      addLog(`Created DAG execution with ID: ${dagExecution.id}`);

      // Subscribe to execution updates
      unsubscribeRef.current = dagEngine.subscribe(dagExecution.id, (execution) => {
        const completed = execution.completedNodes.size + execution.failedNodes.size;
        const percentage = execution.nodes.size > 0 ? (completed / execution.nodes.size) * 100 : 0;
        
        setProgress({
          completed,
          total: execution.nodes.size,
          percentage,
          currentNodes: execution.currentBatch
        });

        if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled') {
          setIsExecuting(false);
        }
      });

      // Execute the workflow
      const result = await workflowExecutor.execute(workflow, {
        maxConcurrency: 2,
        timeout: 120000, // 2 minutes
        retryOptions: { maxRetries: 2, retryDelay: 1000 }
      });

      setExecutionResult(result);
      addLog(`Execution completed with status: ${result.status}`);

      if (result.status === 'completed') {
        toast({
          title: "Workflow executed successfully",
          description: `Completed in ${(result.totalDuration / 1000).toFixed(2)}s with ${result.metadata.completedNodes} nodes`
        });
      } else {
        toast({
          title: "Workflow execution failed",
          description: `${result.metadata.failedNodes} node(s) failed`,
          variant: "destructive"
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addLog(`Execution error: ${errorMessage}`);
      
      toast({
        title: "Execution error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
      
      // Clean up subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }
  }, [isExecuting, addLog]);

  // Cancel execution
  const cancelExecution = useCallback(() => {
    if (currentExecutionId.current) {
      workflowExecutor.cancelExecution(currentExecutionId.current);
      addLog("Execution cancelled by user");
      setIsExecuting(false);
      
      toast({
        title: "Execution cancelled",
        description: "Workflow execution has been cancelled"
      });
    }
  }, [addLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    executeWorkflow,
    cancelExecution,
    isExecuting,
    executionResult,
    error,
    progress,
    executionLogs: executionLogs || []
  };
}
