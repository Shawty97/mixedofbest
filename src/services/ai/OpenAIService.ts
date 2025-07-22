
export interface AIModelConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(
    prompt: string,
    config: Partial<AIModelConfig> = {}
  ): Promise<AIResponse> {
    const {
      model = 'gpt-4o-mini',
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1
    } = config;

    console.log(`🤖 OpenAI API Call: ${model}`);
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens,
          top_p: topP
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      console.log(`✅ OpenAI Response in ${executionTime}ms:`, {
        tokens: data.usage.total_tokens,
        cost: this.calculateCost(data.usage, model)
      });

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        model: data.model,
        finishReason: data.choices[0].finish_reason
      };

    } catch (error) {
      console.error('🔴 OpenAI API Error:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculateCost(usage: any, model: string): number {
    // Pricing per 1K tokens (as of 2024)
    const pricing: { [key: string]: { input: number; output: number } } = {
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4.5-preview': { input: 0.01, output: 0.03 }
    };

    const modelPricing = pricing[model] || pricing['gpt-4o-mini'];
    const inputCost = (usage.prompt_tokens / 1000) * modelPricing.input;
    const outputCost = (usage.completion_tokens / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateCompletion('Test connection', { maxTokens: 10 });
      return response.content.length > 0;
    } catch {
      return false;
    }
  }
}
