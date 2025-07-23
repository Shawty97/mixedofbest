
import { ProcessingMiddleware, NodeProcessingContext, ProcessingResult } from '../processors/BaseNodeProcessor';

export class RetryMiddleware implements ProcessingMiddleware {
  name = 'retry';
  
  async execute(context: NodeProcessingContext, next: () => Promise<ProcessingResult>): Promise<ProcessingResult> {
    const maxRetries = 3;
    const baseDelay = 1000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await next();
        
        if (result.success) {
          return result;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          return result;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed after ${maxRetries + 1} attempts: ${error}`,
            metadata: { executionTime: 0 }
          };
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      error: 'Unexpected retry loop exit',
      metadata: { executionTime: 0 }
    };
  }
}
