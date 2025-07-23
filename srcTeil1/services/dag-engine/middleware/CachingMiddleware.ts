
import { ProcessingMiddleware, NodeProcessingContext, ProcessingResult } from '../processors/BaseNodeProcessor';

export class CachingMiddleware implements ProcessingMiddleware {
  name = 'caching';
  private cache = new Map<string, { result: ProcessingResult; timestamp: number }>();
  private ttl = 300000; // 5 minutes
  
  async execute(context: NodeProcessingContext, next: () => Promise<ProcessingResult>): Promise<ProcessingResult> {
    const cacheKey = this.generateCacheKey(context);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.ttl)) {
      return {
        ...cached.result,
        metadata: {
          ...cached.result.metadata,
          cacheHit: true
        }
      };
    }
    
    // Execute and cache
    const result = await next();
    if (result.success) {
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
    }
    
    return result;
  }
  
  private generateCacheKey(context: NodeProcessingContext): string {
    const inputsHash = this.hashInputs(context.inputs);
    return `${context.nodeId}-${inputsHash}`;
  }
  
  private hashInputs(inputs: Map<string, any>): string {
    const data = JSON.stringify(Array.from(inputs.entries()).sort());
    return btoa(data).slice(0, 16);
  }
}
