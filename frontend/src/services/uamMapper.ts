import { UniversalAgentDefinition } from '@/schemas/universalAgent';
import { exampleUamAgent } from '@/schemas/uam-example';

export interface UamAgentDocument {
  schemaVersion: string;
  meta: {
    name: string;
    version: string;
    author: string;
    description?: string;
    tags?: string[];
  };
  persona: {
    identity: string;
    tonality?: 'professional' | 'friendly' | 'formal' | 'casual' | 'empathetic';
    language: string;
    fallbackLanguages?: string[];
  };
  capabilities: {
    llm: {
      provider: 'openai' | 'azure' | 'anthropic' | 'google';
      model: string;
      temperature?: number;
      maxTokens?: number;
    };
    tts?: {
      providers?: ('azure' | 'elevenlabs' | 'openai' | 'coqui')[];
      voice?: string;
      speed?: number;
    };
    stt?: {
      providers?: ('azure' | 'openai' | 'deepgram')[];
      language?: string;
    };
    memory?: {
      shortTermLimit?: number;
      longTermEnabled?: boolean;
      personalDataRetention?: 'session' | '30d' | '1y' | 'indefinite';
    };
  };
  tools?: Array<{
    name: string;
    type: 'api' | 'function' | 'integration';
    endpoint?: string;
    authentication?: {
      type: 'none' | 'apikey' | 'oauth' | 'basic';
    };
    description?: string;
  }>;
  knowledge?: {
    sources?: Array<{
      name: string;
      type: 'document' | 'database' | 'api' | 'realtime';
      uri?: string;
    }>;
    ragProfile?: {
      chunkSize?: number;
      retrievalLimit?: number;
      similarityThreshold?: number;
    };
  };
  deployment?: {
    channels?: ('web' | 'slack' | 'whatsapp' | 'teams' | 'twilio' | 'widget')[];
    regions?: ('us' | 'eu' | 'asia' | 'global')[];
    scaling?: {
      maxConcurrent?: number;
      autoScale?: boolean;
    };
  };
  compliance?: {
    piiHandling?: 'none' | 'minimal' | 'standard' | 'strict';
    dataResidency?: ('us' | 'eu' | 'asia')[];
    retentionPolicy?: 'session' | '30d' | '1y' | 'indefinite';
    auditLevel?: 'basic' | 'detailed' | 'forensic';
  };
  economics?: {
    budgetLimits?: {
      daily?: number;
      monthly?: number;
    };
    costPerTask?: {
      target?: number;
      maximum?: number;
    };
    throttling?: {
      enabled?: boolean;
      requestsPerMinute?: number;
    };
  };
}

export class UamMapper {
  static readonly CURRENT_UAM_VERSION = "0.1.0";
  
  /**
   * Convert UniversalAgentDefinition to UAM v0.1 format
   */
  static toUam(definition: UniversalAgentDefinition): UamAgentDocument {
    // Map persona instructions to UAM identity format
    const identity = definition.persona.instructions.length > 10 
      ? definition.persona.instructions 
      : `${definition.persona.personality}. ${definition.persona.instructions}`;
    
    // Map tone values to UAM-compatible tonality
    const tonalityMap: Record<string, UamAgentDocument['persona']['tonality']> = {
      'professional': 'professional',
      'casual': 'casual',
      'friendly': 'friendly', 
      'formal': 'formal',
      'custom': 'professional' // fallback
    };
    
    const uamDoc: UamAgentDocument = {
      schemaVersion: this.CURRENT_UAM_VERSION,
      meta: {
        name: definition.name,
        version: definition.version,
        author: definition.metadata.created_by,
        description: definition.description,
        tags: definition.metadata.tags
      },
      persona: {
        identity: identity,
        tonality: tonalityMap[definition.persona.tone] || 'professional',
        language: definition.voice_config?.language || 'en-US',
        fallbackLanguages: ['en']
      },
      capabilities: {
        llm: {
          provider: definition.ai_config.provider as any,
          model: definition.ai_config.model,
          temperature: definition.ai_config.temperature,
          maxTokens: definition.ai_config.max_tokens
        }
      }
    };
    
    // Add voice capabilities if present
    if (definition.voice_config) {
      uamDoc.capabilities.tts = {
        providers: [definition.voice_config.tts_provider as any],
        voice: definition.voice_config.voice_id,
        speed: definition.voice_config.speed
      };
      
      uamDoc.capabilities.stt = {
        providers: [definition.voice_config.stt_provider as any],
        language: definition.voice_config.language
      };
    }
    
    // Add memory configuration
    uamDoc.capabilities.memory = {
      shortTermLimit: 20,
      longTermEnabled: true,
      personalDataRetention: '30d'
    };
    
    // Map tools if present
    if (definition.tools.length > 0) {
      uamDoc.tools = definition.tools.map(tool => ({
        name: tool.name,
        type: tool.type === 'webhook' ? 'api' : tool.type as any,
        endpoint: tool.configuration.endpoint,
        authentication: {
          type: tool.configuration.auth?.type === 'bearer' ? 'oauth' : 
                tool.configuration.auth?.type === 'api_key' ? 'apikey' : 'none'
        },
        description: `${tool.name} integration`
      }));
    }
    
    // Map deployment configuration
    const channelMap: Record<string, string> = {
      'development': 'web',
      'staging': 'web', 
      'production': 'web'
    };
    
    uamDoc.deployment = {
      channels: ['web'],
      regions: ['us'],
      scaling: {
        maxConcurrent: definition.deployment.scaling.max_instances,
        autoScale: definition.deployment.scaling.auto_scale
      }
    };
    
    // Add compliance baseline
    uamDoc.compliance = {
      piiHandling: 'standard',
      dataResidency: ['us'],
      retentionPolicy: '30d',
      auditLevel: 'basic'
    };
    
    // Add economics baseline
    uamDoc.economics = {
      budgetLimits: {
        daily: 50.0,
        monthly: 1000.0
      },
      costPerTask: {
        target: 0.25,
        maximum: 1.0
      },
      throttling: {
        enabled: true,
        requestsPerMinute: definition.security.rate_limits?.requests_per_minute || 30
      }
    };
    
    return uamDoc;
  }
  
  /**
   * Convert UAM document back to UniversalAgentDefinition 
   */
  static fromUam(uamDoc: UamAgentDocument): UniversalAgentDefinition {
    // Map UAM tonality to internal tone union
    const tonalityToInternal: Record<NonNullable<UamAgentDocument['persona']['tonality']>, UniversalAgentDefinition['persona']['tone']> = {
      professional: 'professional',
      casual: 'casual',
      friendly: 'friendly',
      formal: 'formal',
      empathetic: 'friendly', // map to closest available tone
    } as const;

    // Map UAM provider to internal provider union (google -> custom)
    const providerToInternal = (p: UamAgentDocument['capabilities']['llm']['provider']): UniversalAgentDefinition['ai_config']['provider'] => {
      return (p === 'openai' || p === 'azure' || p === 'anthropic') ? p : 'custom';
    };

    const definition: UniversalAgentDefinition = {
      version: uamDoc.meta.version,
      id: `agent-${Date.now()}`,
      name: uamDoc.meta.name,
      description: uamDoc.meta.description,
      category: uamDoc.capabilities.tts ? 'voice' : 'chat',
      persona: {
        personality: uamDoc.persona.identity.substring(0, 100) + '...',
        tone: uamDoc.persona.tonality ? tonalityToInternal[uamDoc.persona.tonality] : 'professional',
        instructions: uamDoc.persona.identity,
        greeting: "Hello! How can I assist you today?",
        ending_message: "Thank you for using our service!"
      },
      ai_config: {
        provider: providerToInternal(uamDoc.capabilities.llm.provider),
        model: uamDoc.capabilities.llm.model,
        temperature: uamDoc.capabilities.llm.temperature || 0.7,
        max_tokens: uamDoc.capabilities.llm.maxTokens || 1000
      },
      capabilities: [],
      tools: uamDoc.tools?.map(tool => ({
        id: tool.name.toLowerCase().replace(/\s+/g, '_'),
        name: tool.name,
        type: tool.type === 'api' ? 'webhook' : tool.type as any,
        configuration: {
          endpoint: tool.endpoint,
          auth: tool.authentication?.type ? {
            type: tool.authentication.type === 'apikey' ? 'api_key' : 
                  tool.authentication.type === 'oauth' ? 'bearer' : 'basic',
            credentials: {}
          } : undefined
        }
      })) || [],
      knowledge_sources: uamDoc.knowledge?.sources?.map(source => ({
        id: source.name.toLowerCase().replace(/\s+/g, '_'),
        name: source.name,
        type: (source.type === 'realtime' ? 'api' : source.type) as any,
        source_url: source.uri
      })) || [],
      security: {
        access_level: 'private',
        rate_limits: {
          requests_per_minute: uamDoc.economics?.throttling?.requestsPerMinute || 60,
          concurrent_sessions: 10
        },
        data_retention: {
          conversation_logs: 30,
          analytics_data: 90,
          user_data: 365,
          compliance_logs: 2555
        }
      },
      deployment: {
        environments: ['development'],
        scaling: {
          min_instances: 1,
          max_instances: uamDoc.deployment?.scaling?.maxConcurrent || 5,
          auto_scale: uamDoc.deployment?.scaling?.autoScale ?? true
        },
        resources: {
          cpu_limit: "500m",
          memory_limit: "1Gi",
          gpu_required: false,
          quantum_compute: false
        }
      },
      metadata: {
        created_by: uamDoc.meta.author || "unknown",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: Array.isArray(uamDoc.meta.tags) ? [...uamDoc.meta.tags] : []
      }
    };

    // Add voice config if TTS/STT capabilities exist
    if (uamDoc.capabilities.tts || uamDoc.capabilities.stt) {
      definition.voice_config = {
        tts_provider: (uamDoc.capabilities.tts?.providers?.[0] as any) || 'elevenlabs',
        voice_id: uamDoc.capabilities.tts?.voice,
        stt_provider: (uamDoc.capabilities.stt?.providers?.[0] as any) || 'openai',
        language: uamDoc.capabilities.stt?.language || uamDoc.persona.language,
        speed: uamDoc.capabilities.tts?.speed || 1.0,
        pitch: 1.0
      };
    }

    return definition;
  }
  
  /**
   * Generate a UAM template for quick start
   */
  static generateUamTemplate(): UamAgentDocument {
    // Construct a mutable UAM template from the readonly example
    return {
      schemaVersion: exampleUamAgent.schemaVersion,
      meta: {
        name: exampleUamAgent.meta.name,
        version: exampleUamAgent.meta.version,
        author: exampleUamAgent.meta.author,
        description: exampleUamAgent.meta.description,
        tags: exampleUamAgent.meta.tags ? [...exampleUamAgent.meta.tags] : []
      },
      persona: {
        identity: exampleUamAgent.persona.identity,
        tonality: exampleUamAgent.persona.tonality as any,
        language: exampleUamAgent.persona.language,
        fallbackLanguages: exampleUamAgent.persona.fallbackLanguages ? [...exampleUamAgent.persona.fallbackLanguages] : []
      },
      capabilities: {
        llm: {
          provider: exampleUamAgent.capabilities.llm.provider as any,
          model: exampleUamAgent.capabilities.llm.model,
          temperature: exampleUamAgent.capabilities.llm.temperature,
          maxTokens: exampleUamAgent.capabilities.llm.maxTokens,
        },
        tts: exampleUamAgent.capabilities.tts ? {
          providers: exampleUamAgent.capabilities.tts.providers ? [...exampleUamAgent.capabilities.tts.providers] as any : undefined,
          voice: exampleUamAgent.capabilities.tts.voice,
          speed: exampleUamAgent.capabilities.tts.speed,
        } : undefined,
        stt: exampleUamAgent.capabilities.stt ? {
          providers: exampleUamAgent.capabilities.stt.providers ? [...exampleUamAgent.capabilities.stt.providers] as any : undefined,
          language: exampleUamAgent.capabilities.stt.language,
        } : undefined,
        memory: exampleUamAgent.capabilities.memory ? {
          shortTermLimit: exampleUamAgent.capabilities.memory.shortTermLimit,
          longTermEnabled: exampleUamAgent.capabilities.memory.longTermEnabled,
          personalDataRetention: exampleUamAgent.capabilities.memory.personalDataRetention as any,
        } : undefined,
      },
      tools: exampleUamAgent.tools ? exampleUamAgent.tools.map(t => ({
        name: t.name,
        type: t.type as any,
        endpoint: (t as any).endpoint,
        authentication: (t as any).authentication,
        description: t.description,
      })) : undefined,
      knowledge: exampleUamAgent.knowledge ? {
        sources: exampleUamAgent.knowledge.sources ? exampleUamAgent.knowledge.sources.map(s => ({
          name: s.name,
          type: s.type as any,
          uri: s.uri,
        })) : undefined,
        ragProfile: exampleUamAgent.knowledge.ragProfile ? {
          chunkSize: exampleUamAgent.knowledge.ragProfile.chunkSize,
          retrievalLimit: exampleUamAgent.knowledge.ragProfile.retrievalLimit,
          similarityThreshold: exampleUamAgent.knowledge.ragProfile.similarityThreshold,
        } : undefined,
      } : undefined,
      deployment: exampleUamAgent.deployment ? {
        channels: exampleUamAgent.deployment.channels ? [...exampleUamAgent.deployment.channels] as any : undefined,
        regions: exampleUamAgent.deployment.regions ? [...exampleUamAgent.deployment.regions] as any : undefined,
        scaling: exampleUamAgent.deployment.scaling ? {
          maxConcurrent: exampleUamAgent.deployment.scaling.maxConcurrent,
          autoScale: exampleUamAgent.deployment.scaling.autoScale,
        } : undefined,
      } : undefined,
      compliance: exampleUamAgent.compliance ? {
        piiHandling: exampleUamAgent.compliance.piiHandling as any,
        dataResidency: exampleUamAgent.compliance.dataResidency ? [...exampleUamAgent.compliance.dataResidency] as any : undefined,
        retentionPolicy: exampleUamAgent.compliance.retentionPolicy as any,
        auditLevel: exampleUamAgent.compliance.auditLevel as any,
      } : undefined,
      economics: exampleUamAgent.economics ? {
        budgetLimits: exampleUamAgent.economics.budgetLimits ? {
          daily: exampleUamAgent.economics.budgetLimits.daily,
          monthly: exampleUamAgent.economics.budgetLimits.monthly,
        } : undefined,
        costPerTask: exampleUamAgent.economics.costPerTask ? {
          target: exampleUamAgent.economics.costPerTask.target,
          maximum: exampleUamAgent.economics.costPerTask.maximum,
        } : undefined,
        throttling: exampleUamAgent.economics.throttling ? {
          enabled: exampleUamAgent.economics.throttling.enabled,
          requestsPerMinute: exampleUamAgent.economics.throttling.requestsPerMinute,
        } : undefined,
      } : undefined,
    };
  }
}