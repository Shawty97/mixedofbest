
import { Node, Edge } from '@xyflow/react';
import { SavedWorkflow } from '@/components/workflow/store/workflowStore';

export interface DAGNode {
  id: string;
  type: string;
  data: any;
  dependencies: string[];
  dependents: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface DAGExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  nodes: Map<string, DAGNode>;
  executionOrder: string[];
  currentBatch: string[];
  completedNodes: Set<string>;
  failedNodes: Set<string>;
  results: Map<string, any>;
  errors: Map<string, string>;
}

export class DAGEngine {
  private executions: Map<string, DAGExecution> = new Map();
  private listeners: Map<string, ((execution: DAGExecution) => void)[]> = new Map();

  // Convert workflow to DAG structure
  createDAG(workflow: SavedWorkflow): DAGExecution {
    const execution: DAGExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: workflow.id,
      status: 'pending',
      startTime: new Date(),
      nodes: new Map(),
      executionOrder: [],
      currentBatch: [],
      completedNodes: new Set(),
      failedNodes: new Set(),
      results: new Map(),
      errors: new Map()
    };

    // Convert workflow nodes to DAG nodes
    const nodeMap = new Map<string, Node>();
    workflow.nodes.forEach(node => nodeMap.set(node.id, node));

    // Build dependency graph
    const dependencies = new Map<string, string[]>();
    const dependents = new Map<string, string[]>();

    // Initialize empty dependencies
    workflow.nodes.forEach(node => {
      dependencies.set(node.id, []);
      dependents.set(node.id, []);
    });

    // Build dependencies from edges
    workflow.edges.forEach(edge => {
      const sourceDeps = dependents.get(edge.source) || [];
      sourceDeps.push(edge.target);
      dependents.set(edge.source, sourceDeps);

      const targetDeps = dependencies.get(edge.target) || [];
      targetDeps.push(edge.source);
      dependencies.set(edge.target, targetDeps);
    });

    // Create DAG nodes
    workflow.nodes.forEach(node => {
      const dagNode: DAGNode = {
        id: node.id,
        type: node.type || 'unknown',
        data: node.data || {},
        dependencies: dependencies.get(node.id) || [],
        dependents: dependents.get(node.id) || [],
        status: 'pending'
      };
      execution.nodes.set(node.id, dagNode);
    });

    // Calculate execution order using topological sort
    execution.executionOrder = this.topologicalSort(execution.nodes);
    execution.currentBatch = this.getReadyNodes(execution);

    this.executions.set(execution.id, execution);
    return execution;
  }

  // Topological sort for execution order
  private topologicalSort(nodes: Map<string, DAGNode>): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: string[] = [];

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        throw new Error(`Circular dependency detected involving node: ${nodeId}`);
      }
      if (visited.has(nodeId)) return;

      temp.add(nodeId);
      const node = nodes.get(nodeId);
      if (node) {
        node.dependents.forEach(dependent => visit(dependent));
      }
      temp.delete(nodeId);
      visited.add(nodeId);
      result.unshift(nodeId);
    };

    Array.from(nodes.keys()).forEach(nodeId => {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    });

    return result;
  }

  // Get nodes ready for execution (no pending dependencies)
  private getReadyNodes(execution: DAGExecution): string[] {
    const ready: string[] = [];
    
    execution.nodes.forEach((node, nodeId) => {
      if (node.status === 'pending') {
        const allDepsCompleted = node.dependencies.every(depId => 
          execution.completedNodes.has(depId)
        );
        if (allDepsCompleted) {
          ready.push(nodeId);
        }
      }
    });

    return ready;
  }

  // Mark node as completed and update execution state
  completeNode(executionId: string, nodeId: string, result: any): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const node = execution.nodes.get(nodeId);
    if (!node) return;

    node.status = 'completed';
    node.result = result;
    node.endTime = new Date();
    
    execution.completedNodes.add(nodeId);
    execution.results.set(nodeId, result);

    // Remove from current batch
    execution.currentBatch = execution.currentBatch.filter(id => id !== nodeId);

    // Add new ready nodes to current batch
    const newReady = this.getReadyNodes(execution);
    newReady.forEach(readyNodeId => {
      if (!execution.currentBatch.includes(readyNodeId)) {
        execution.currentBatch.push(readyNodeId);
      }
    });

    // Check if execution is complete
    if (execution.completedNodes.size + execution.failedNodes.size === execution.nodes.size) {
      execution.status = execution.failedNodes.size > 0 ? 'failed' : 'completed';
      execution.endTime = new Date();
    }

    this.notifyListeners(executionId, execution);
  }

  // Mark node as failed
  failNode(executionId: string, nodeId: string, error: string): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const node = execution.nodes.get(nodeId);
    if (!node) return;

    node.status = 'failed';
    node.error = error;
    node.endTime = new Date();
    
    execution.failedNodes.add(nodeId);
    execution.errors.set(nodeId, error);

    // Remove from current batch
    execution.currentBatch = execution.currentBatch.filter(id => id !== nodeId);

    // Mark dependent nodes as skipped
    this.markDependentsAsSkipped(execution, nodeId);

    // Check if execution should fail
    if (execution.currentBatch.length === 0) {
      execution.status = 'failed';
      execution.endTime = new Date();
    }

    this.notifyListeners(executionId, execution);
  }

  // Mark all dependent nodes as skipped when a dependency fails
  private markDependentsAsSkipped(execution: DAGExecution, failedNodeId: string): void {
    const node = execution.nodes.get(failedNodeId);
    if (!node) return;

    node.dependents.forEach(dependentId => {
      const dependentNode = execution.nodes.get(dependentId);
      if (dependentNode && dependentNode.status === 'pending') {
        dependentNode.status = 'skipped';
        this.markDependentsAsSkipped(execution, dependentId);
      }
    });
  }

  // Get execution by ID
  getExecution(executionId: string): DAGExecution | undefined {
    return this.executions.get(executionId);
  }

  // Subscribe to execution updates
  subscribe(executionId: string, callback: (execution: DAGExecution) => void): () => void {
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

  // Notify all listeners of execution updates
  private notifyListeners(executionId: string, execution: DAGExecution): void {
    const callbacks = this.listeners.get(executionId);
    if (callbacks) {
      callbacks.forEach(callback => callback(execution));
    }
  }

  // Cancel execution
  cancelExecution(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.status = 'cancelled';
      execution.endTime = new Date();
      this.notifyListeners(executionId, execution);
    }
  }

  // Clean up completed executions
  cleanup(executionId: string): void {
    this.executions.delete(executionId);
    this.listeners.delete(executionId);
  }
}

export const dagEngine = new DAGEngine();
