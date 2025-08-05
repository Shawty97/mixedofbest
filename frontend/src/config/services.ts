// Universal Agent Platform - Service Configuration
// Phase 2: Service Integration Setup

export interface ServiceConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  enabled: boolean;
  demoMode: boolean;
  rateLimit?: number;
  timeout?: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  service: string;
}

// Helper to safely access environment variables
const getEnvVar = (key: string): string | undefined => {
  return typeof window !== 'undefined' ? (window as any)[key] : undefined;
};

// Service configurations with demo fallbacks
export const serviceConfigs = {
  openai: {
    name: 'OpenAI',
    apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
    baseUrl: 'https://api.openai.com/v1',
    enabled: !!getEnvVar('VITE_OPENAI_API_KEY'),
    demoMode: !getEnvVar('VITE_OPENAI_API_KEY') || getEnvVar('VITE_ENABLE_DEMO_MODE') === 'true',
    rateLimit: 60, // requests per minute
    timeout: 30000 // 30 seconds
  },

  elevenlabs: {
    name: 'ElevenLabs',
    apiKey: getEnvVar('VITE_ELEVENLABS_API_KEY'),
    baseUrl: 'https://api.elevenlabs.io/v1',
    enabled: !!getEnvVar('VITE_ELEVENLABS_API_KEY'),
    demoMode: !getEnvVar('VITE_ELEVENLABS_API_KEY') || getEnvVar('VITE_ENABLE_DEMO_MODE') === 'true',
    rateLimit: 30,
    timeout: 45000
  },

  azure: {
    name: 'Azure Speech Services',
    apiKey: getEnvVar('VITE_AZURE_SPEECH_KEY'),
    baseUrl: getEnvVar('VITE_AZURE_SPEECH_REGION'),
    enabled: !!(getEnvVar('VITE_AZURE_SPEECH_KEY') && getEnvVar('VITE_AZURE_SPEECH_REGION')),
    demoMode: !(getEnvVar('VITE_AZURE_SPEECH_KEY') && getEnvVar('VITE_AZURE_SPEECH_REGION')) || getEnvVar('VITE_ENABLE_DEMO_MODE') === 'true',
    rateLimit: 20,
    timeout: 30000
  },

  qdrant: {
    name: 'Qdrant Vector Database',
    apiKey: getEnvVar('VITE_QDRANT_API_KEY'),
    baseUrl: getEnvVar('VITE_QDRANT_URL'),
    enabled: !!getEnvVar('VITE_QDRANT_URL'),
    demoMode: !getEnvVar('VITE_QDRANT_URL') || getEnvVar('VITE_ENABLE_DEMO_MODE') === 'true',
    rateLimit: 100,
    timeout: 15000
  }
} as const;

// Service health check utility
export class ServiceHealthChecker {
  static async checkAllServices(): Promise<ServiceResponse[]> {
    const checks = [
      this.checkOpenAI(),
      this.checkElevenLabs(),
      this.checkAzure(),
      this.checkQdrant()
    ];

    return Promise.all(checks);
  }

  static async checkOpenAI(): Promise<ServiceResponse> {
    const config = serviceConfigs.openai;
    
    if (config.demoMode) {
      return {
        success: true,
        data: { status: 'demo', message: 'Running in demo mode' },
        service: config.name
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(`${config.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      return {
        success: response.ok,
        data: { status: response.ok ? 'healthy' : 'unhealthy' },
        service: config.name
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: config.name
      };
    }
  }

  static async checkElevenLabs(): Promise<ServiceResponse> {
    const config = serviceConfigs.elevenlabs;
    
    if (config.demoMode) {
      return {
        success: true,
        data: { status: 'demo', message: 'Running in demo mode' },
        service: config.name
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(`${config.baseUrl}/user/subscription`, {
        headers: {
          'xi-api-key': config.apiKey!,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      return {
        success: response.ok,
        data: { status: response.ok ? 'healthy' : 'unhealthy' },
        service: config.name
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: config.name
      };
    }
  }

  static async checkAzure(): Promise<ServiceResponse> {
    const config = serviceConfigs.azure;
    
    if (config.demoMode) {
      return {
        success: true,
        data: { status: 'demo', message: 'Running in demo mode' },
        service: config.name
      };
    }

    return {
      success: true,
      data: { status: 'healthy', message: 'Azure service configured' },
      service: config.name
    };
  }

  static async checkQdrant(): Promise<ServiceResponse> {
    const config = serviceConfigs.qdrant;
    
    if (config.demoMode) {
      return {
        success: true,
        data: { status: 'demo', message: 'Running in demo mode' },
        service: config.name
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(`${config.baseUrl}/collections`, {
        headers: config.apiKey ? { 'api-key': config.apiKey } : {},
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      return {
        success: response.ok,
        data: { status: response.ok ? 'healthy' : 'unhealthy' },
        service: config.name
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: config.name
      };
    }
  }

  static async checkService(serviceKey: string): Promise<ServiceResponse> {
    switch (serviceKey) {
      case 'openai':
        return this.checkOpenAI();
      case 'elevenlabs':
        return this.checkElevenLabs();
      case 'azure':
        return this.checkAzure();
      case 'qdrant':
        return this.checkQdrant();
      default:
        return {
          success: false,
          error: `Unknown service: ${serviceKey}`,
          service: serviceKey
        };
    }
  }
}

// Service usage tracker
export class ServiceUsageTracker {
  private static requests: Map<string, number[]> = new Map();

  static recordRequest(service: string) {
    const now = Date.now();
    const requests = this.requests.get(service) || [];
    requests.push(now);
    
    // Keep only last 60 seconds
    const cutoff = now - 60000;
    const filtered = requests.filter(time => time > cutoff);
    
    this.requests.set(service, filtered);
  }

  static getRateLimitStatus(service: string): { current: number; limit: number } {
    const config = serviceConfigs[service as keyof typeof serviceConfigs];
    if (!config) return { current: 0, limit: 0 };

    const requests = this.requests.get(service) || [];
    return {
      current: requests.length,
      limit: config.rateLimit || 60
    };
  }

  static canMakeRequest(service: string): boolean {
    const status = this.getRateLimitStatus(service);
    return status.current < status.limit;
  }
}