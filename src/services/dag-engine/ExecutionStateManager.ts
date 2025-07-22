
import { DAGExecution } from './DAGEngine';

export interface ExecutionState {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    totalNodes: number;
    completedNodes: number;
    failedNodes: number;
    currentlyRunning: string[];
  };
  metrics: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    totalTokens?: number;
    totalCost?: number;
  };
  nodeStates: Map<string, {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    result?: any;
    error?: string;
  }>;
}

export class ExecutionStateManager {
  private states: Map<string, ExecutionState> = new Map();
  private listeners: Map<string, ((state: ExecutionState) => void)[]> = new Map();
  
  // Create initial state from DAG execution
  createState(execution: DAGExecution): ExecutionState {
    const nodeStates = new Map();
    
    execution.nodes.forEach((node, nodeId) => {
      nodeStates.set(nodeId, {
        status: node.status,
        startTime: node.startTime,
        endTime: node.endTime,
        duration: node.startTime && node.endTime ? 
          node.endTime.getTime() - node.startTime.getTime() : undefined,
        result: node.result,
        error: node.error
      });
    });
    
    const state: ExecutionState = {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      progress: {
        totalNodes: execution.nodes.size,
        completedNodes: execution.completedNodes.size,
        failedNodes: execution.failedNodes.size,
        currentlyRunning: execution.currentBatch
      },
      metrics: {
        startTime: execution.startTime,
        endTime: execution.endTime,
        duration: execution.endTime ? 
          execution.endTime.getTime() - execution.startTime.getTime() : undefined
      },
      nodeStates
    };
    
    this.states.set(execution.id, state);
    return state;
  }
  
  // Update state from DAG execution
  updateState(execution: DAGExecution): ExecutionState {
    const existingState = this.states.get(execution.id);
    if (!existingState) {
      return this.createState(execution);
    }
    
    // Update progress
    existingState.status = execution.status;
    existingState.progress.completedNodes = execution.completedNodes.size;
    existingState.progress.failedNodes = execution.failedNodes.size;
    existingState.progress.currentlyRunning = execution.currentBatch;
    
    // Update metrics
    existingState.metrics.endTime = execution.endTime;
    existingState.metrics.duration = execution.endTime ? 
      execution.endTime.getTime() - execution.startTime.getTime() : undefined;
    
    // Update node states
    execution.nodes.forEach((node, nodeId) => {
      const nodeState = existingState.nodeStates.get(nodeId);
      if (nodeState) {
        nodeState.status = node.status;
        nodeState.startTime = node.startTime;
        nodeState.endTime = node.endTime;
        nodeState.duration = node.startTime && node.endTime ? 
          node.endTime.getTime() - node.startTime.getTime() : undefined;
        nodeState.result = node.result;
        nodeState.error = node.error;
      }
    });
    
    // Calculate totals
    let totalTokens = 0;
    let totalCost = 0;
    
    existingState.nodeStates.forEach(nodeState => {
      if (nodeState.result && typeof nodeState.result === 'object') {
        totalTokens += nodeState.result.tokenCount || 0;
        totalCost += nodeState.result.cost || 0;
      }
    });
    
    existingState.metrics.totalTokens = totalTokens > 0 ? totalTokens : undefined;
    existingState.metrics.totalCost = totalCost > 0 ? totalCost : undefined;
    
    this.notifyListeners(execution.id, existingState);
    return existingState;
  }
  
  // Get execution state
  getState(executionId: string): ExecutionState | undefined {
    return this.states.get(executionId);
  }
  
  // Get all states for a workflow
  getWorkflowStates(workflowId: string): ExecutionState[] {
    return Array.from(this.states.values()).filter(
      state => state.workflowId === workflowId
    );
  }
  
  // Subscribe to state changes
  subscribe(executionId: string, callback: (state: ExecutionState) => void): () => void {
    if (!this.listeners.has(executionId)) {
      this.listeners.set(executionId, []);
    }
    this.listeners.get(executionId)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(executionId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  // Notify listeners
  private notifyListeners(executionId: string, state: ExecutionState): void {
    const callbacks = this.listeners.get(executionId);
    if (callbacks) {
      callbacks.forEach(callback => callback(state));
    }
  }
  
  // Clean up old states
  cleanup(executionId: string): void {
    this.states.delete(executionId);
    this.listeners.delete(executionId);
  }
  
  // Get execution statistics
  getStatistics(workflowId?: string): {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    totalTokens: number;
    totalCost: number;
  } {
    const states = workflowId ? 
      this.getWorkflowStates(workflowId) : 
      Array.from(this.states.values());
    
    const completedStates = states.filter(state => 
      state.status === 'completed' || state.status === 'failed'
    );
    
    const successfulStates = completedStates.filter(state => 
      state.status === 'completed'
    );
    
    const totalDuration = completedStates.reduce((sum, state) => 
      sum + (state.metrics.duration || 0), 0
    );
    
    const totalTokens = states.reduce((sum, state) => 
      sum + (state.metrics.totalTokens || 0), 0
    );
    
    const totalCost = states.reduce((sum, state) => 
      sum + (state.metrics.totalCost || 0), 0
    );
    
    return {
      totalExecutions: completedStates.length,
      successRate: completedStates.length > 0 ? 
        (successfulStates.length / completedStates.length) * 100 : 0,
      averageDuration: completedStates.length > 0 ? 
        totalDuration / completedStates.length : 0,
      totalTokens,
      totalCost
    };
  }
}

export const executionStateManager = new ExecutionStateManager();
