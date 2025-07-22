
import { OpenAIService } from './OpenAIService';
import { AnthropicService } from './AnthropicService';

export type AIProvider = 'openai' | 'anthropic';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export class AIServiceFactory {
  private static instances = new Map<string, OpenAIService | AnthropicService>();

  static createService(config: AIServiceConfig): OpenAIService | AnthropicService {
    const key = `${config.provider}-${config.apiKey.slice(-8)}`;
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    let service: OpenAIService | AnthropicService;

    switch (config.provider) {
      case 'openai':
        service = new OpenAIService(config.apiKey);
        break;
      case 'anthropic':
        service = new AnthropicService(config.apiKey);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }

    this.instances.set(key, service);
    return service;
  }

  static async testAllConnections(configs: AIServiceConfig[]): Promise<{
    provider: AIProvider;
    connected: boolean;
    error?: string;
  }[]> {
    const results = await Promise.allSettled(
      configs.map(async (config) => {
        try {
          const service = this.createService(config);
          const connected = await service.testConnection();
          return { provider: config.provider, connected };
        } catch (error) {
          return {
            provider: config.provider,
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        provider: 'openai' as AIProvider,
        connected: false,
        error: 'Connection test failed'
      }
    );
  }
}
