
export interface PerformanceMetrics {
  nodeId: string;
  executionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cached';
  memoryUsage?: number;
  cpuUsage?: number;
  tokensUsed?: number;
  cost?: number;
  cacheHit?: boolean;
  retryCount?: number;
  throughput?: number;
}

export interface ExecutionMetrics {
  executionId: string;
  workflowId: string;
  overallStartTime: number;
  overallEndTime?: number;
  totalDuration?: number;
  nodeMetrics: Map<string, PerformanceMetrics>;
  aggregatedMetrics: {
    totalNodes: number;
    completedNodes: number;
    failedNodes: number;
    cachedNodes: number;
    totalTokens: number;
    totalCost: number;
    averageNodeDuration: number;
    successRate: number;
    cacheHitRate: number;
    throughputPerSecond: number;
  };
  realTimeUpdates: {
    currentlyRunning: string[];
    queuedNodes: string[];
    bottlenecks: string[];
    estimatedCompletion: number;
  };
}

export class PerformanceMonitor {
  private executionMetrics: Map<string, ExecutionMetrics> = new Map();
  private nodePerformanceHistory: Map<string, PerformanceMetrics[]> = new Map();
  private listeners: Map<string, ((metrics: ExecutionMetrics) => void)[]> = new Map();
  private updateInterval: number = 1000; // 1 second updates
  private intervalId: NodeJS.Timeout | null = null;

  startMonitoring(executionId: string, workflowId: string, nodeIds: string[]): void {
    const metrics: ExecutionMetrics = {
      executionId,
      workflowId,
      overallStartTime: Date.now(),
      nodeMetrics: new Map(),
      aggregatedMetrics: {
        totalNodes: nodeIds.length,
        completedNodes: 0,
        failedNodes: 0,
        cachedNodes: 0,
        totalTokens: 0,
        totalCost: 0,
        averageNodeDuration: 0,
        successRate: 0,
        cacheHitRate: 0,
        throughputPerSecond: 0
      },
      realTimeUpdates: {
        currentlyRunning: [],
        queuedNodes: nodeIds.slice(),
        bottlenecks: [],
        estimatedCompletion: 0
      }
    };

    this.executionMetrics.set(executionId, metrics);
    this.startRealTimeUpdates(executionId);
  }

  recordNodeStart(executionId: string, nodeId: string): void {
    const metrics = this.executionMetrics.get(executionId);
    if (!metrics) return;

    const nodeMetric: PerformanceMetrics = {
      nodeId,
      executionId,
      startTime: Date.now(),
      status: 'running'
    };

    metrics.nodeMetrics.set(nodeId, nodeMetric);
    metrics.realTimeUpdates.currentlyRunning.push(nodeId);
    metrics.realTimeUpdates.queuedNodes = metrics.realTimeUpdates.queuedNodes.filter(id => id !== nodeId);

    this.updateAggregatedMetrics(executionId);
    this.notifyListeners(executionId, metrics);
  }

  recordNodeCompletion(
    executionId: string, 
    nodeId: string, 
    success: boolean, 
    additionalData?: {
      tokensUsed?: number;
      cost?: number;
      cacheHit?: boolean;
      retryCount?: number;
      memoryUsage?: number;
    }
  ): void {
    const metrics = this.executionMetrics.get(executionId);
    if (!metrics) return;

    const nodeMetric = metrics.nodeMetrics.get(nodeId);
    if (!nodeMetric) return;

    const endTime = Date.now();
    nodeMetric.endTime = endTime;
    nodeMetric.duration = endTime - nodeMetric.startTime;
    nodeMetric.status = success ? 'completed' : 'failed';

    if (additionalData) {
      Object.assign(nodeMetric, additionalData);
      if (additionalData.cacheHit) {
        nodeMetric.status = 'cached';
      }
    }

    // Update running nodes
    metrics.realTimeUpdates.currentlyRunning = metrics.realTimeUpdates.currentlyRunning.filter(id => id !== nodeId);

    // Store in history
    const history = this.nodePerformanceHistory.get(nodeId) || [];
    history.push({ ...nodeMetric });
    this.nodePerformanceHistory.set(nodeId, history.slice(-100)); // Keep last 100 executions

    this.updateAggregatedMetrics(executionId);
    this.detectBottlenecks(executionId);
    this.notifyListeners(executionId, metrics);
  }

  private updateAggregatedMetrics(executionId: string): void {
    const metrics = this.executionMetrics.get(executionId);
    if (!metrics) return;

    const nodeMetrics = Array.from(metrics.nodeMetrics.values());
    const completedNodes = nodeMetrics.filter(n => n.status === 'completed' || n.status === 'cached');
    const failedNodes = nodeMetrics.filter(n => n.status === 'failed');
    const cachedNodes = nodeMetrics.filter(n => n.status === 'cached');

    metrics.aggregatedMetrics.completedNodes = completedNodes.length;
    metrics.aggregatedMetrics.failedNodes = failedNodes.length;
    metrics.aggregatedMetrics.cachedNodes = cachedNodes.length;

    metrics.aggregatedMetrics.totalTokens = nodeMetrics.reduce((sum, n) => sum + (n.tokensUsed || 0), 0);
    metrics.aggregatedMetrics.totalCost = nodeMetrics.reduce((sum, n) => sum + (n.cost || 0), 0);

    const completedDurations = completedNodes.map(n => n.duration || 0).filter(d => d > 0);
    metrics.aggregatedMetrics.averageNodeDuration = completedDurations.length > 0 
      ? completedDurations.reduce((sum, d) => sum + d, 0) / completedDurations.length 
      : 0;

    metrics.aggregatedMetrics.successRate = metrics.aggregatedMetrics.totalNodes > 0 
      ? (completedNodes.length / metrics.aggregatedMetrics.totalNodes) * 100 
      : 0;

    metrics.aggregatedMetrics.cacheHitRate = nodeMetrics.length > 0 
      ? (cachedNodes.length / nodeMetrics.length) * 100 
      : 0;

    // Calculate throughput
    const totalTime = Date.now() - metrics.overallStartTime;
    metrics.aggregatedMetrics.throughputPerSecond = totalTime > 0 
      ? (completedNodes.length / (totalTime / 1000)) 
      : 0;

    // Estimate completion time
    if (metrics.realTimeUpdates.currentlyRunning.length > 0 && metrics.aggregatedMetrics.averageNodeDuration > 0) {
      const remainingNodes = metrics.realTimeUpdates.queuedNodes.length + metrics.realTimeUpdates.currentlyRunning.length;
      metrics.realTimeUpdates.estimatedCompletion = Date.now() + (remainingNodes * metrics.aggregatedMetrics.averageNodeDuration);
    }
  }

  private detectBottlenecks(executionId: string): void {
    const metrics = this.executionMetrics.get(executionId);
    if (!metrics) return;

    const bottlenecks: string[] = [];
    const avgDuration = metrics.aggregatedMetrics.averageNodeDuration;

    metrics.nodeMetrics.forEach((nodeMetric, nodeId) => {
      if (nodeMetric.duration && nodeMetric.duration > avgDuration * 2) {
        bottlenecks.push(nodeId);
      }
    });

    metrics.realTimeUpdates.bottlenecks = bottlenecks;
  }

  private startRealTimeUpdates(executionId: string): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const metrics = this.executionMetrics.get(executionId);
      if (metrics) {
        this.updateAggregatedMetrics(executionId);
        this.notifyListeners(executionId, metrics);
      }
    }, this.updateInterval);
  }

  stopMonitoring(executionId: string): ExecutionMetrics | undefined {
    const metrics = this.executionMetrics.get(executionId);
    if (metrics) {
      metrics.overallEndTime = Date.now();
      metrics.totalDuration = metrics.overallEndTime - metrics.overallStartTime;
      this.updateAggregatedMetrics(executionId);
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    return metrics;
  }

  subscribe(executionId: string, callback: (metrics: ExecutionMetrics) => void): () => void {
    if (!this.listeners.has(executionId)) {
      this.listeners.set(executionId, []);
    }
    this.listeners.get(executionId)!.push(callback);

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

  private notifyListeners(executionId: string, metrics: ExecutionMetrics): void {
    const callbacks = this.listeners.get(executionId);
    if (callbacks) {
      callbacks.forEach(callback => callback(metrics));
    }
  }

  getExecutionMetrics(executionId: string): ExecutionMetrics | undefined {
    return this.executionMetrics.get(executionId);
  }

  getNodeHistory(nodeId: string): PerformanceMetrics[] {
    return this.nodePerformanceHistory.get(nodeId) || [];
  }

  cleanup(executionId: string): void {
    this.executionMetrics.delete(executionId);
    this.listeners.delete(executionId);
  }
}

export const performanceMonitor = new PerformanceMonitor();
