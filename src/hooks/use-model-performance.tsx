import { useState, useEffect } from 'react';
import useWorkflowStore from '@/components/workflow/store/workflowStore';

export interface ModelPerformanceData {
  modelId: string;
  providerId: string;
  totalExecutions: number;
  averageLatencyMs: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  costData: {
    input: number;
    output: number;
    total: number;
  };
  successRate: number;
  lastExecution: Date | null;
  totalCost: number;
  costPerToken: number;
  timeSeriesData?: {
    timestamps: Date[];
    latency: number[];
    tokenCounts: number[];
    costs: number[];
  };
}

export function useModelPerformance(modelId?: string, providerId?: string) {
  const [performanceData, setPerformanceData] = useState<ModelPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getCurrentWorkflow } = useWorkflowStore();

  useEffect(() => {
    if (!modelId) {
      setIsLoading(false);
      return;
    }

    // Get current workflow performance data
    const workflow = getCurrentWorkflow();
    if (!workflow || !workflow.performance) {
      setPerformanceData(null);
      setIsLoading(false);
      return;
    }

    // Find nodes that match the model ID
    const matchingNodes = Object.keys(workflow.performance.nodes || {})
      .filter(nodeId => {
        const node = workflow.nodes.find(n => n.id === nodeId);
        return node && 
               node.type === 'aiModel' && 
               node.data?.model === modelId &&
               (!providerId || node.data?.provider === providerId);
      })
      .map(nodeId => ({
        nodeId,
        performanceData: workflow.performance.nodes[nodeId],
        node: workflow.nodes.find(n => n.id === nodeId)
      }));

    if (matchingNodes.length === 0) {
      setPerformanceData(null);
      setIsLoading(false);
      return;
    }

    // Aggregate performance data
    const totalExecutions = matchingNodes.length;
    const successfulExecutions = matchingNodes.filter(n => n.performanceData.status === 'success').length;
    const totalLatency = matchingNodes.reduce((sum, n) => sum + (n.performanceData.executionTime || 0), 0);
    
    // Better estimation for token usage
    const totalTokensInput = matchingNodes.reduce((sum, n) => {
      if (n.performanceData.inputTokens !== undefined) {
        return sum + n.performanceData.inputTokens;
      } else if (n.performanceData.tokenCount) {
        // Estimate if we don't have specific input token counts
        return sum + Math.floor(n.performanceData.tokenCount * 0.3);
      }
      return sum;
    }, 0);
    
    const totalTokensOutput = matchingNodes.reduce((sum, n) => {
      if (n.performanceData.outputTokens !== undefined) {
        return sum + n.performanceData.outputTokens;
      } else if (n.performanceData.tokenCount) {
        // Estimate if we don't have specific output token counts
        return sum + Math.floor(n.performanceData.tokenCount * 0.7);
      }
      return sum;
    }, 0);
    
    const totalCost = matchingNodes.reduce((sum, n) => sum + (n.performanceData.cost || 0), 0);
    
    // Find most recent execution time
    const executionTimes = matchingNodes
      .map(n => n.performanceData.lastRun)
      .filter(Boolean)
      .map(date => date instanceof Date ? date : new Date(date as any));
    
    const lastExecution = executionTimes.length > 0 
      ? new Date(Math.max(...executionTimes.map(d => d.getTime()))) 
      : null;

    // Calculate cost per token
    const totalTokens = totalTokensInput + totalTokensOutput;
    const costPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;

    // Calculate input and output costs based on model rates
    // Most models charge ~3-4x more for output tokens than input
    const outputCostRatio = 0.8; // 80% of cost goes to output tokens
    const outputCost = totalCost * outputCostRatio;
    const inputCost = totalCost - outputCost;

    // Generate time series data (simulate for now)
    const timeSeriesData = generateTimeSeriesData(matchingNodes);

    setPerformanceData({
      modelId,
      providerId: providerId || '',
      totalExecutions,
      averageLatencyMs: totalExecutions > 0 ? totalLatency / totalExecutions : 0,
      tokenUsage: {
        input: totalTokensInput,
        output: totalTokensOutput,
        total: totalTokensInput + totalTokensOutput
      },
      costData: {
        input: inputCost,
        output: outputCost,
        total: totalCost
      },
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      lastExecution,
      totalCost,
      costPerToken,
      timeSeriesData
    });

    setIsLoading(false);
  }, [modelId, providerId, getCurrentWorkflow]);

  // Helper function to generate time series data
  function generateTimeSeriesData(nodes: any[]) {
    if (nodes.length < 2) return undefined;
    
    // Sort nodes by lastRun timestamp
    const sortedNodes = [...nodes].sort((a, b) => {
      const aTime = a.performanceData.lastRun ? new Date(a.performanceData.lastRun).getTime() : 0;
      const bTime = b.performanceData.lastRun ? new Date(b.performanceData.lastRun).getTime() : 0;
      return aTime - bTime;
    });
    
    return {
      timestamps: sortedNodes.map(n => 
        n.performanceData.lastRun ? new Date(n.performanceData.lastRun) : new Date()
      ),
      latency: sortedNodes.map(n => n.performanceData.executionTime || 0),
      tokenCounts: sortedNodes.map(n => n.performanceData.tokenCount || 0),
      costs: sortedNodes.map(n => n.performanceData.cost || 0)
    };
  }

  return { performanceData, isLoading };
}
