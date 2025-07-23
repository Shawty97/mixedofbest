
import { AIModelConfig } from './OpenAIService';

export interface AnthropicResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  stopReason: string;
}

export class AnthropicService {
  private apiKey: string;
  private baseURL = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(
    prompt: string,
    config: Partial<AIModelConfig> = {}
  ): Promise<AnthropicResponse> {
    const {
      model = 'claude-3-haiku-20240307',
      temperature = 0.7,
      maxTokens = 1000
    } = config;

    console.log(`🤖 Anthropic API Call: ${model}`);
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      console.log(`✅ Anthropic Response in ${executionTime}ms:`, {
        tokens: data.usage.input_tokens + data.usage.output_tokens,
        cost: this.calculateCost(data.usage, model)
      });

      return {
        content: data.content[0].text,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        },
        model: data.model,
        stopReason: data.stop_reason
      };

    } catch (error) {
      console.error('🔴 Anthropic API Error:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculateCost(usage: any, model: string): number {
    // Pricing per 1K tokens
    const pricing: { [key: string]: { input: number; output: number } } = {
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
    };

    const modelPricing = pricing[model] || pricing['claude-3-haiku-20240307'];
    const inputCost = (usage.input_tokens / 1000) * modelPricing.input;
    const outputCost = (usage.output_tokens / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateCompletion('Test connection', { maxTokens: 10 });
      return response.content.length > 0;
    } catch {
      return false;
    }
  }
}
