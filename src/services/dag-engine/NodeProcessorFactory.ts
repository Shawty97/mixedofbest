
import { BaseNodeProcessor } from './processors/BaseNodeProcessor';
import { AIModelProcessor } from './processors/AIModelProcessor';
import { ProcessingNodeProcessor } from './processors/ProcessingNodeProcessor';
import { CachingMiddleware } from './middleware/CachingMiddleware';
import { RetryMiddleware } from './middleware/RetryMiddleware';

export class NodeProcessorFactory {
  private static processors = new Map<string, () => BaseNodeProcessor>();
  private static cachingMiddleware = new CachingMiddleware();
  private static retryMiddleware = new RetryMiddleware();
  
  static {
    // Register default processors
    this.registerProcessor('aiModel', () => {
      const processor = new AIModelProcessor();
      processor.addMiddleware(this.retryMiddleware);
      processor.addMiddleware(this.cachingMiddleware);
      return processor;
    });
    
    this.registerProcessor('processing', () => {
      const processor = new ProcessingNodeProcessor();
      processor.addMiddleware(this.cachingMiddleware);
      return processor;
    });
    
    this.registerProcessor('advancedProcessing', () => {
      const processor = new ProcessingNodeProcessor();
      processor.addMiddleware(this.cachingMiddleware);
      return processor;
    });
  }
  
  static registerProcessor(nodeType: string, factory: () => BaseNodeProcessor): void {
    this.processors.set(nodeType, factory);
  }
  
  static getProcessor(nodeType: string): BaseNodeProcessor | null {
    const factory = this.processors.get(nodeType);
    return factory ? factory() : null;
  }
  
  static getAvailableTypes(): string[] {
    return Array.from(this.processors.keys());
  }
}
