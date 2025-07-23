
import { BaseNodeProcessor, NodeProcessingContext, ProcessingResult } from './BaseNodeProcessor';
import { AIServiceFactory, AIProvider } from '@/services/ai/AIServiceFactory';

export class AIModelProcessor extends BaseNodeProcessor {
  protected async executeCore(context: NodeProcessingContext): Promise<ProcessingResult> {
    console.log(`🤖 Processing AI Model Node: ${context.nodeId}`);

    try {
      const nodeData = context.inputs.get('nodeData') as any;
      const { provider, model, temperature, maxTokens, prompt, apiKey } = nodeData;

      // Validate required fields
      if (!provider || !apiKey || !prompt) {
        throw new Error('Missing required AI configuration: provider, apiKey, or prompt');
      }

      // Get inputs from previous nodes
      const inputTexts: string[] = [];
      context.inputs.forEach((value, key) => {
        if (key !== 'nodeData' && value) {
          if (typeof value === 'object' && value.text) {
            inputTexts.push(value.text);
          } else if (typeof value === 'string') {
            inputTexts.push(value);
          } else {
            inputTexts.push(JSON.stringify(value));
          }
        }
      });

      // Build final prompt
      const inputContext = inputTexts.length > 0 ? `\n\nInput Context:\n${inputTexts.join('\n\n')}` : '';
      const finalPrompt = `${prompt}${inputContext}`;

      // Create AI service
      const aiService = AIServiceFactory.createService({
        provider: provider as AIProvider,
        apiKey,
        model
      });

      // Generate AI response
      let response;
      if (provider === 'anthropic') {
        response = await (aiService as any).generateCompletion(finalPrompt, {
          model,
          temperature: temperature || 0.7,
          maxTokens: maxTokens || 1000
        });
      } else {
        response = await (aiService as any).generateCompletion(finalPrompt, {
          model,
          temperature: temperature || 0.7,
          maxTokens: maxTokens || 1000
        });
      }

      // Calculate cost
      const cost = this.calculateCost(response.usage, model, provider);

      console.log(`✅ AI Model processed:`, {
        provider,
        model,
        tokens: response.usage.totalTokens,
        cost: `$${cost.toFixed(6)}`,
        responseLength: response.content.length
      });

      const result = {
        text: response.content,
        metadata: {
          provider,
          model,
          usage: response.usage,
          cost,
          finishReason: (response as any).finishReason || (response as any).stopReason
        },
        timestamp: new Date(),
        nodeId: context.nodeId
      };

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: 0, // Will be set by base class
          tokensUsed: response.usage.totalTokens,
          inputTokens: response.usage.inputTokens || response.usage.promptTokens,
          outputTokens: response.usage.outputTokens || response.usage.completionTokens,
          cost,
          cacheHit: false,
          memoryUsage: Math.round(process.memoryUsage?.().heapUsed / 1024 / 1024) || 0
        }
      };

    } catch (error) {
      console.error(`🔴 AI Model processing failed for ${context.nodeId}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI model processing failed',
        metadata: {
          executionTime: 0,
          tokensUsed: 0,
          cost: 0,
          cacheHit: false
        }
      };
    }
  }

  private calculateCost(usage: any, model: string, provider: string): number {
    const inputTokens = usage.inputTokens || usage.promptTokens || 0;
    const outputTokens = usage.outputTokens || usage.completionTokens || 0;

    // Pricing per 1K tokens
    const pricing: { [key: string]: { [model: string]: { input: number; output: number } } } = {
      openai: {
        'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
        'gpt-4o': { input: 0.005, output: 0.015 },
        'gpt-4.5-preview': { input: 0.01, output: 0.03 }
      },
      anthropic: {
        'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
        'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
        'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
      }
    };

    const providerPricing = pricing[provider];
    if (!providerPricing) return 0;

    const modelPricing = providerPricing[model] || Object.values(providerPricing)[0];
    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;

    return inputCost + outputCost;
  }
}
