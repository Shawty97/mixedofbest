
import { BaseNodeProcessor, NodeProcessingContext, ProcessingResult } from './BaseNodeProcessor';

interface ProcessingConfig {
  type: 'transform' | 'filter' | 'branch' | 'aggregate' | 'validate';
  operation: string;
  parameters: Record<string, any>;
}

export class ProcessingNodeProcessor extends BaseNodeProcessor {
  protected async executeCore(context: NodeProcessingContext): Promise<ProcessingResult> {
    const nodeData = context.inputs.get('nodeData');
    const config = this.extractConfig(nodeData);
    
    const inputData = this.collectInputData(context);
    const result = await this.processData(inputData, config);
    
    return {
      success: true,
      data: result,
      metadata: {
        executionTime: 0,
        tokensUsed: 0
      }
    };
  }
  
  private extractConfig(nodeData: any): ProcessingConfig {
    return {
      type: nodeData.processingType || 'transform',
      operation: nodeData.transformType || nodeData.operation || 'passthrough',
      parameters: nodeData.parameters || {}
    };
  }
  
  private collectInputData(context: NodeProcessingContext): any[] {
    const data: any[] = [];
    context.inputs.forEach((value, key) => {
      if (key !== 'nodeData') {
        data.push(value);
      }
    });
    return data;
  }
  
  private async processData(inputData: any[], config: ProcessingConfig): Promise<any> {
    switch (config.type) {
      case 'transform':
        return this.transformData(inputData, config);
      case 'filter':
        return this.filterData(inputData, config);
      case 'branch':
        return this.branchData(inputData, config);
      case 'aggregate':
        return this.aggregateData(inputData, config);
      case 'validate':
        return this.validateData(inputData, config);
      default:
        return inputData;
    }
  }
  
  private transformData(data: any[], config: ProcessingConfig): any {
    switch (config.operation) {
      case 'json':
        return {
          type: 'json',
          data: data,
          transformed: true,
          timestamp: new Date()
        };
      case 'text':
        return {
          type: 'text',
          text: data.map(item => 
            typeof item === 'object' ? JSON.stringify(item) : String(item)
          ).join(' '),
          transformed: true
        };
      case 'uppercase':
        return data.map(item => 
          typeof item === 'string' ? item.toUpperCase() : item
        );
      case 'lowercase':
        return data.map(item => 
          typeof item === 'string' ? item.toLowerCase() : item
        );
      case 'extract':
        const field = config.parameters.field;
        return data.map(item => 
          typeof item === 'object' && field ? item[field] : item
        );
      default:
        return data;
    }
  }
  
  private filterData(data: any[], config: ProcessingConfig): any[] {
    switch (config.operation) {
      case 'removeEmpty':
        return data.filter(item => item != null && item !== '');
      case 'removeNull':
        return data.filter(item => item != null);
      case 'unique':
        return [...new Set(data)];
      case 'length':
        const minLength = config.parameters.minLength || 0;
        return data.filter(item => 
          typeof item === 'string' ? item.length >= minLength : true
        );
      default:
        return data;
    }
  }
  
  private branchData(data: any[], config: ProcessingConfig): any {
    const condition = config.parameters.condition || 'random';
    let result = false;
    
    switch (condition) {
      case 'random':
        result = Math.random() > 0.5;
        break;
      case 'hasData':
        result = data.length > 0;
        break;
      case 'isEmpty':
        result = data.length === 0;
        break;
      default:
        result = false;
    }
    
    return {
      condition: result,
      path: result ? 'true' : 'false',
      data: data,
      branchingLogic: condition
    };
  }
  
  private aggregateData(data: any[], config: ProcessingConfig): any {
    switch (config.operation) {
      case 'count':
        return { count: data.length, items: data };
      case 'concat':
        return {
          text: data.map(item => 
            typeof item === 'object' ? JSON.stringify(item) : String(item)
          ).join(' '),
          itemCount: data.length
        };
      case 'average':
        const numbers = data.filter(item => typeof item === 'number');
        const avg = numbers.length > 0 ? 
          numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
        return { average: avg, count: numbers.length };
      default:
        return { items: data, count: data.length };
    }
  }
  
  private validateData(data: any[], config: ProcessingConfig): any {
    const schema = config.parameters.schema || {};
    const results = data.map(item => {
      const validation = this.validateItem(item, schema);
      return {
        item,
        valid: validation.valid,
        errors: validation.errors
      };
    });
    
    return {
      results,
      validCount: results.filter(r => r.valid).length,
      totalCount: results.length,
      validationPassed: results.every(r => r.valid)
    };
  }
  
  private validateItem(item: any, schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (schema.required && !item) {
      errors.push('Item is required');
    }
    
    if (schema.type && typeof item !== schema.type) {
      errors.push(`Expected ${schema.type}, got ${typeof item}`);
    }
    
    if (schema.minLength && typeof item === 'string' && item.length < schema.minLength) {
      errors.push(`Minimum length is ${schema.minLength}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
