
export interface NodeProcessingContext {
  nodeId: string;
  executionId: string;
  inputs: Map<string, any>;
  metadata: {
    retryCount: number;
    startTime: number;
    timeout: number;
  };
  environment: {
    apiKeys: Map<string, string>;
    settings: Map<string, any>;
  };
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    executionTime: number;
    tokensUsed?: number;
    inputTokens?: number;
    outputTokens?: number;
    cost?: number;
    cacheHit?: boolean;
    memoryUsage?: number;
  };
}

export interface ProcessingMiddleware {
  name: string;
  execute(context: NodeProcessingContext, next: () => Promise<ProcessingResult>): Promise<ProcessingResult>;
}

export abstract class BaseNodeProcessor {
  protected middleware: ProcessingMiddleware[] = [];
  
  addMiddleware(middleware: ProcessingMiddleware): void {
    this.middleware.push(middleware);
  }
  
  async process(context: NodeProcessingContext): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.executeWithMiddleware(context, 0);
      return {
        ...result,
        metadata: {
          ...result.metadata,
          executionTime: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime
        }
      };
    }
  }
  
  private async executeWithMiddleware(context: NodeProcessingContext, middlewareIndex: number): Promise<ProcessingResult> {
    if (middlewareIndex >= this.middleware.length) {
      return this.executeCore(context);
    }
    
    const middleware = this.middleware[middlewareIndex];
    return middleware.execute(context, () => 
      this.executeWithMiddleware(context, middlewareIndex + 1)
    );
  }
  
  protected abstract executeCore(context: NodeProcessingContext): Promise<ProcessingResult>;
}
