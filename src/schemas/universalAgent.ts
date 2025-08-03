import Ajv from 'ajv';
import yaml from 'js-yaml';

// Universal Agent Metamodel Schema - The industry's first cross-platform agent definition standard
export interface UniversalAgentDefinition {
  // Core Identity
  version: string;
  id: string;
  name: string;
  description?: string;
  category: 'voice' | 'chat' | 'multimodal' | 'workflow' | 'autonomous';
  
  // Persona & Behavior
  persona: {
    personality: string;
    tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'custom';
    instructions: string;
    greeting?: string;
    ending_message?: string;
    fallback_responses?: string[];
  };
  
  // AI Configuration
  ai_config: {
    provider: 'openai' | 'azure' | 'anthropic' | 'custom';
    model: string;
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
  };
  
  // Voice Configuration (for voice agents)
  voice_config?: {
    tts_provider: 'elevenlabs' | 'openai' | 'azure' | 'custom';
    voice_id?: string;
    stt_provider: 'openai' | 'deepgram' | 'azure' | 'custom';
    language: string;
    accent?: string;
    speed?: number;
    pitch?: number;
  };
  
  // Capabilities & Tools
  capabilities: AgentCapability[];
  tools: AgentTool[];
  
  // Knowledge & Data Sources
  knowledge_sources: KnowledgeSource[];
  
  // Workflow & Orchestration
  workflows?: WorkflowDefinition[];
  sub_agents?: string[]; // IDs of other agents this can spawn
  
  // Security & Access
  security: {
    access_level: 'public' | 'private' | 'enterprise';
    allowed_domains?: string[];
    rate_limits?: RateLimit;
    data_retention?: DataRetention;
  };
  
  // Deployment Configuration
  deployment: {
    environments: ('development' | 'staging' | 'production')[];
    scaling: {
      min_instances: number;
      max_instances: number;
      auto_scale: boolean;
    };
    resources: {
      cpu_limit?: string;
      memory_limit?: string;
      gpu_required?: boolean;
      quantum_compute?: boolean;
    };
  };
  
  // Monetization
  pricing?: {
    model: 'free' | 'subscription' | 'usage' | 'hybrid';
    base_cost?: number;
    usage_cost?: number;
    currency: string;
  };
  
  // Metadata
  metadata: {
    created_by: string;
    created_at: string;
    updated_at: string;
    version_history?: string[];
    tags?: string[];
    compliance?: ComplianceInfo[];
  };
}

export interface AgentCapability {
  id: string;
  name: string;
  type: 'built-in' | 'plugin' | 'custom';
  provider?: string;
  configuration?: Record<string, any>;
  quantum_enhanced?: boolean;
}

export interface AgentTool {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'database' | 'calendar' | 'crm' | 'custom';
  configuration: {
    endpoint?: string;
    auth?: {
      type: 'bearer' | 'basic' | 'oauth' | 'api_key';
      credentials?: Record<string, string>;
    };
    parameters?: Record<string, any>;
  };
  quantum_optimized?: boolean;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'document' | 'database' | 'api' | 'website' | 'vector_store';
  source_url?: string;
  embedding_model?: string;
  sync_frequency?: string;
  access_permissions?: string[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  trigger: {
    type: 'manual' | 'scheduled' | 'event' | 'condition';
    configuration: Record<string, any>;
  };
  steps: WorkflowStep[];
  quantum_optimization?: boolean;
}

export interface WorkflowStep {
  id: string;
  type: 'agent_action' | 'api_call' | 'condition' | 'loop' | 'quantum_compute';
  configuration: Record<string, any>;
  next_steps?: string[];
}

export interface RateLimit {
  requests_per_minute?: number;
  requests_per_hour?: number;
  requests_per_day?: number;
  concurrent_sessions?: number;
}

export interface DataRetention {
  conversation_logs: number; // days
  analytics_data: number; // days
  user_data: number; // days
  compliance_logs: number; // days
}

export interface ComplianceInfo {
  standard: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI' | 'custom';
  certification_date?: string;
  expiry_date?: string;
  audit_trail_required: boolean;
}

// JSON Schema for validation
export const universalAgentSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["version", "id", "name", "category", "persona", "ai_config", "capabilities", "security", "deployment", "metadata"],
  properties: {
    version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1, maxLength: 100 },
    description: { type: "string", maxLength: 500 },
    category: { 
      type: "string", 
      enum: ["voice", "chat", "multimodal", "workflow", "autonomous"] 
    },
    persona: {
      type: "object",
      required: ["personality", "tone", "instructions"],
      properties: {
        personality: { type: "string", minLength: 10 },
        tone: { 
          type: "string", 
          enum: ["professional", "casual", "friendly", "formal", "custom"] 
        },
        instructions: { type: "string", minLength: 20 },
        greeting: { type: "string" },
        ending_message: { type: "string" },
        fallback_responses: {
          type: "array",
          items: { type: "string" }
        }
      }
    },
    ai_config: {
      type: "object",
      required: ["provider", "model"],
      properties: {
        provider: { 
          type: "string", 
          enum: ["openai", "azure", "anthropic", "custom"] 
        },
        model: { type: "string" },
        temperature: { type: "number", minimum: 0, maximum: 2 },
        max_tokens: { type: "integer", minimum: 1 },
        system_prompt: { type: "string" }
      }
    },
    // ... additional schema properties would be defined here
  }
};

// Validator instance
const ajv = new Ajv({ allErrors: true });
export const validateUniversalAgent = ajv.compile(universalAgentSchema);

// Utility functions
export class UniversalAgentManager {
  static validateDefinition(definition: UniversalAgentDefinition): { valid: boolean; errors?: string[] } {
    const valid = validateUniversalAgent(definition);
    if (!valid) {
      return {
        valid: false,
        errors: validateUniversalAgent.errors?.map(err => `${err.instancePath}: ${err.message}`) || []
      };
    }
    return { valid: true };
  }
  
  static fromYAML(yamlString: string): UniversalAgentDefinition {
    try {
      return yaml.load(yamlString) as UniversalAgentDefinition;
    } catch (error) {
      throw new Error(`Invalid YAML: ${error}`);
    }
  }
  
  static toYAML(definition: UniversalAgentDefinition): string {
    return yaml.dump(definition, { 
      indent: 2,
      lineWidth: 120,
      noRefs: true 
    });
  }
  
  static generateTemplate(category: UniversalAgentDefinition['category']): UniversalAgentDefinition {
    const baseTemplate: UniversalAgentDefinition = {
      version: "1.0.0",
      id: `agent-${Date.now()}`,
      name: "New Agent",
      category,
      persona: {
        personality: "Professional and helpful assistant",
        tone: "professional",
        instructions: "You are a helpful AI assistant. Always be polite and provide accurate information.",
        greeting: "Hello! How can I assist you today?",
        ending_message: "Thank you for using our service!"
      },
      ai_config: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        max_tokens: 1000
      },
      capabilities: [],
      tools: [],
      knowledge_sources: [],
      security: {
        access_level: "private",
        rate_limits: {
          requests_per_minute: 60,
          concurrent_sessions: 10
        },
        data_retention: {
          conversation_logs: 30,
          analytics_data: 90,
          user_data: 365,
          compliance_logs: 2555 // 7 years
        }
      },
      deployment: {
        environments: ["development"],
        scaling: {
          min_instances: 1,
          max_instances: 5,
          auto_scale: true
        },
        resources: {
          cpu_limit: "500m",
          memory_limit: "1Gi",
          gpu_required: false,
          quantum_compute: false
        }
      },
      metadata: {
        created_by: "system",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: [category]
      }
    };
    
    // Add category-specific configurations
    if (category === 'voice') {
      baseTemplate.voice_config = {
        tts_provider: "elevenlabs",
        stt_provider: "openai",
        language: "en-US",
        speed: 1.0,
        pitch: 1.0
      };
    }
    
    return baseTemplate;
  }
  
  static upgrade(definition: any, targetVersion: string): UniversalAgentDefinition {
    // Version upgrade logic - handle backward compatibility
    const currentVersion = definition.version || "1.0.0";
    
    if (currentVersion === targetVersion) {
      return definition;
    }
    
    // Migration logic based on version differences
    // This would contain actual migration code for schema changes
    definition.version = targetVersion;
    definition.metadata.updated_at = new Date().toISOString();
    
    return definition;
  }
}