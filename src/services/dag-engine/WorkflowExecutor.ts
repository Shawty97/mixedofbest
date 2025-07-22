import { dagEngine, DAGExecution, DAGNode } from './DAGEngine';
import { NodeExecutorFactory, NodeExecutionContext } from './NodeExecutor';
import { performanceMonitor } from './PerformanceMonitor';
import { SavedWorkflow } from '@/components/workflow/store/workflowStore';

export interface WorkflowExecutionOptions {
  maxConcurrency?: number;
  timeout?: number;
  retryOptions?: {
    maxRetries: number;
    retryDelay: number;
  };
}

export interface WorkflowExecutionResult {
  executionId: string;
  status: 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  nodeResults: Map<string, any>;
  errors: Map<string, string>;
  finalOutput?: any;
  metadata: {
    totalNodes: number;
    completedNodes: number;
    failedNodes: number;
    skippedNodes: number;
    totalTokens?: number;
    totalCost?: number;
  };
}

export class WorkflowExecutor {
  private activeExecutions: Set<string> = new Set();
  
  async execute(
    workflow: SavedWorkflow, 
    options: WorkflowExecutionOptions = {}
  ): Promise<WorkflowExecutionResult> {
    const {
      maxConcurrency = 3,
      timeout = 300000, // 5 minutes default
      retryOptions = { maxRetries: 3, retryDelay: 1000 }
    } = options;
    
    // Create DAG execution
    const execution = dagEngine.createDAG(workflow);
    this.activeExecutions.add(execution.id);
    
    // Start performance monitoring
    const nodeIds = Array.from(execution.nodes.keys());
    performanceMonitor.startMonitoring(execution.id, workflow.id, nodeIds);
    
    try {
      // Start execution
      execution.status = 'running';
      
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Workflow execution timeout')), timeout);
      });
      
      // Execute workflow
      const executionPromise = this.executeDAG(execution, maxConcurrency, retryOptions);
      
      // Race between execution and timeout
      await Promise.race([executionPromise, timeoutPromise]);
      
      // Build final result
      return this.buildExecutionResult(execution);
      
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      throw error;
    } finally {
      this.activeExecutions.delete(execution.id);
      
      // Stop performance monitoring
      performanceMonitor.stopMonitoring(execution.id);
      
      // Clean up after some time
      setTimeout(() => {
        dagEngine.cleanup(execution.id);
        performanceMonitor.cleanup(execution.id);
      }, 60000);
    }
  }
  
  private async executeDAG(
    execution: DAGExecution, 
    maxConcurrency: number,
    retryOptions: { maxRetries: number; retryDelay: number }
  ): Promise<void> {
    const runningNodes = new Set<string>();
    const retryCount = new Map<string, number>();
    
    while (execution.status === 'running') {
      // Get nodes ready for execution
      const readyNodes = execution.currentBatch.filter(nodeId => 
        !runningNodes.has(nodeId)
      ).slice(0, maxConcurrency - runningNodes.size);
      
      if (readyNodes.length === 0 && runningNodes.size === 0) {
        // No more nodes to execute
        break;
      }
      
      // Start execution of ready nodes
      const executionPromises = readyNodes.map(async (nodeId) => {
        runningNodes.add(nodeId);
        
        try {
          await this.executeNode(execution, nodeId);
        } catch (error) {
          // Handle retry logic
          const currentRetries = retryCount.get(nodeId) || 0;
          if (currentRetries < retryOptions.maxRetries) {
            retryCount.set(nodeId, currentRetries + 1);
            
            // Wait before retry
            await new Promise(resolve => 
              setTimeout(resolve, retryOptions.retryDelay * Math.pow(2, currentRetries))
            );
            
            // Reset node status for retry
            const node = execution.nodes.get(nodeId);
            if (node) {
              node.status = 'pending';
              runningNodes.delete(nodeId);
              return;
            }
          }
          
          // Max retries reached or other error
          dagEngine.failNode(execution.id, nodeId, error instanceof Error ? error.message : String(error));
        } finally {
          runningNodes.delete(nodeId);
        }
      });
      
      // Wait for at least one node to complete
      if (executionPromises.length > 0) {
        await Promise.race(executionPromises);
      }
      
      // Small delay to prevent tight loop
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  private async executeNode(execution: DAGExecution, nodeId: string): Promise<void> {
    const node = execution.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    
    // Start performance tracking
    performanceMonitor.recordNodeStart(execution.id, nodeId);
    
    // Mark node as running
    node.status = 'running';
    node.startTime = new Date();
    
    // Get executor for node type
    const executor = NodeExecutorFactory.getExecutor(node.type);
    if (!executor) {
      performanceMonitor.recordNodeCompletion(execution.id, nodeId, false);
      throw new Error(`No executor found for node type: ${node.type}`);
    }
    
    // Prepare execution context
    const inputs = new Map<string, any>();
    
    // Collect inputs from dependency nodes
    node.dependencies.forEach(depId => {
      const result = execution.results.get(depId);
      if (result !== undefined) {
        inputs.set(depId, result);
      }
    });
    
    const context: NodeExecutionContext = {
      nodeId,
      node,
      inputs,
      executionId: execution.id,
      workflowId: execution.workflowId
    };
    
    // Execute node
    const result = await executor.execute(context);
    
    if (result.success) {
      dagEngine.completeNode(execution.id, nodeId, result.result);
      
      // Record successful completion with performance data
      performanceMonitor.recordNodeCompletion(execution.id, nodeId, true, {
        tokensUsed: result.metadata?.tokenCount,
        cost: result.metadata?.cost,
        cacheHit: result.metadata?.cacheHit,
        memoryUsage: result.metadata?.memoryUsage
      });
      
      // Store execution metadata
      if (result.metadata) {
        const performanceData = {
          status: 'success',
          executionTime: result.metadata.executionTime,
          tokenCount: result.metadata.tokenCount,
          inputTokens: result.metadata.inputTokens,
          outputTokens: result.metadata.outputTokens,
          cost: result.metadata.cost,
          cacheHit: result.metadata.cacheHit,
          lastRun: new Date()
        };
        
        console.log(`Node ${nodeId} performance:`, performanceData);
      }
    } else {
      // Record failed completion
      performanceMonitor.recordNodeCompletion(execution.id, nodeId, false);
      throw new Error(result.error || 'Node execution failed');
    }
  }
  
  private buildExecutionResult(execution: DAGExecution): WorkflowExecutionResult {
    const endTime = execution.endTime || new Date();
    const totalDuration = endTime.getTime() - execution.startTime.getTime();
    
    // Calculate totals
    let totalTokens = 0;
    let totalCost = 0;
    
    execution.nodes.forEach(node => {
      // In a real implementation, we'd get this from stored metadata
      if (node.result && typeof node.result === 'object') {
        totalTokens += node.result.tokenCount || 0;
        totalCost += node.result.cost || 0;
      }
    });
    
    // Find final output (from output nodes)
    let finalOutput: any = null;
    execution.nodes.forEach((node, nodeId) => {
      if (node.type === 'output' && node.status === 'completed') {
        finalOutput = node.result;
      }
    });
    
    // Count node statuses
    let completedNodes = 0;
    let failedNodes = 0;
    let skippedNodes = 0;
    
    execution.nodes.forEach(node => {
      switch (node.status) {
        case 'completed':
          completedNodes++;
          break;
        case 'failed':
          failedNodes++;
          break;
        case 'skipped':
          skippedNodes++;
          break;
      }
    });
    
    return {
      executionId: execution.id,
      status: execution.status === 'completed' ? 'completed' : 
              execution.status === 'cancelled' ? 'cancelled' : 'failed',
      startTime: execution.startTime,
      endTime,
      totalDuration,
      nodeResults: new Map(execution.results),
      errors: new Map(execution.errors),
      finalOutput,
      metadata: {
        totalNodes: execution.nodes.size,
        completedNodes,
        failedNodes,
        skippedNodes,
        totalTokens: totalTokens > 0 ? totalTokens : undefined,
        totalCost: totalCost > 0 ? totalCost : undefined
      }
    };
  }
  
  // Cancel a running execution
  cancelExecution(executionId: string): void {
    if (this.activeExecutions.has(executionId)) {
      dagEngine.cancelExecution(executionId);
      this.activeExecutions.delete(executionId);
    }
  }
  
  // Get execution status
  getExecutionStatus(executionId: string): DAGExecution | undefined {
    return dagEngine.getExecution(executionId);
  }
  
  // Subscribe to execution updates
  subscribeToExecution(
    executionId: string, 
    callback: (execution: DAGExecution) => void
  ): () => void {
    return dagEngine.subscribe(executionId, callback);
  }
}

export const workflowExecutor = new WorkflowExecutor();
