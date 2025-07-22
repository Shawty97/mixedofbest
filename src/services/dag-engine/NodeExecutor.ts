
import { DAGNode } from './DAGEngine';
import { NodeProcessorFactory } from './NodeProcessorFactory';
import { NodeProcessingContext } from './processors/BaseNodeProcessor';

export interface NodeExecutionContext {
  nodeId: string;
  node: DAGNode;
  inputs: Map<string, any>;
  executionId: string;
  workflowId: string;
}

export interface NodeExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    tokenCount?: number;
    cost?: number;
    outputTokens?: number;
    inputTokens?: number;
    cacheHit?: boolean;
    memoryUsage?: number;
  };
}

export abstract class BaseNodeExecutor {
  abstract execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;
  
  protected createSuccessResult(result: any, metadata?: any): NodeExecutionResult {
    return {
      success: true,
      result,
      metadata
    };
  }
  
  protected createErrorResult(error: string): NodeExecutionResult {
    return {
      success: false,
      error
    };
  }
}

export class InputNodeExecutor extends BaseNodeExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    
    try {
      const content = context.node.data.content || '';
      const result = {
        text: content,
        timestamp: new Date(),
        nodeId: context.nodeId
      };
      
      return this.createSuccessResult(result, {
        executionTime: Date.now() - startTime
      });
    } catch (error) {
      return this.createErrorResult(`Input node execution failed: ${error}`);
    }
  }
}

export class AIModelNodeExecutor extends BaseNodeExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const processor = NodeProcessorFactory.getProcessor('aiModel');
    if (!processor) {
      return this.createErrorResult('AI Model processor not available');
    }
    
    const processingContext: NodeProcessingContext = {
      nodeId: context.nodeId,
      executionId: context.executionId,
      inputs: new Map([...context.inputs, ['nodeData', context.node.data]]),
      metadata: {
        retryCount: 0,
        startTime: Date.now(),
        timeout: 30000
      },
      environment: {
        apiKeys: new Map(),
        settings: new Map()
      }
    };
    
    const result = await processor.process(processingContext);
    
    return {
      success: result.success,
      result: result.data,
      error: result.error,
      metadata: {
        executionTime: result.metadata.executionTime,
        tokenCount: result.metadata.tokensUsed,
        cost: result.metadata.cost,
        cacheHit: result.metadata.cacheHit
      }
    };
  }
}

export class ProcessingNodeExecutor extends BaseNodeExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const processor = NodeProcessorFactory.getProcessor('processing');
    if (!processor) {
      return this.createErrorResult('Processing processor not available');
    }
    
    const processingContext: NodeProcessingContext = {
      nodeId: context.nodeId,
      executionId: context.executionId,
      inputs: new Map([...context.inputs, ['nodeData', context.node.data]]),
      metadata: {
        retryCount: 0,
        startTime: Date.now(),
        timeout: 10000
      },
      environment: {
        apiKeys: new Map(),
        settings: new Map()
      }
    };
    
    const result = await processor.process(processingContext);
    
    return {
      success: result.success,
      result: result.data,
      error: result.error,
      metadata: {
        executionTime: result.metadata.executionTime,
        cacheHit: result.metadata.cacheHit
      }
    };
  }
}

export class OutputNodeExecutor extends BaseNodeExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    
    try {
      const { format, outputType } = context.node.data;
      
      // Collect all inputs
      const inputs = Array.from(context.inputs.values());
      
      let result: any;
      
      switch (format) {
        case 'json':
          result = {
            output: inputs,
            format: 'json',
            timestamp: new Date(),
            nodeId: context.nodeId
          };
          break;
        case 'text':
          result = {
            output: inputs.map(input => 
              typeof input === 'object' ? JSON.stringify(input) : String(input)
            ).join('\n'),
            format: 'text',
            timestamp: new Date(),
            nodeId: context.nodeId
          };
          break;
        default:
          result = {
            output: inputs,
            format: 'raw',
            timestamp: new Date(),
            nodeId: context.nodeId
          };
      }
      
      return this.createSuccessResult(result, {
        executionTime: Date.now() - startTime
      });
    } catch (error) {
      return this.createErrorResult(`Output node execution failed: ${error}`);
    }
  }
}

// Node executor factory
export class NodeExecutorFactory {
  private static executors: Map<string, BaseNodeExecutor> = new Map([
    ['input', new InputNodeExecutor()],
    ['aiModel', new AIModelNodeExecutor()],
    ['processing', new ProcessingNodeExecutor()],
    ['advancedProcessing', new ProcessingNodeExecutor()],
    ['output', new OutputNodeExecutor()]
  ]);
  
  static getExecutor(nodeType: string): BaseNodeExecutor | undefined {
    return this.executors.get(nodeType);
  }
  
  static registerExecutor(nodeType: string, executor: BaseNodeExecutor): void {
    this.executors.set(nodeType, executor);
  }
}
