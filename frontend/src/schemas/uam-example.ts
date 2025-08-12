export const exampleUamAgent = {
  schemaVersion: "0.1.0",
  meta: {
    name: "Customer Service Assistant",
    version: "1.0.0",
    author: "AImpact Platform Team",
    description: "Professional customer service agent with voice capabilities",
    tags: ["customer-service", "voice", "support"],
  },
  persona: {
    identity:
      "I am a professional customer service assistant dedicated to helping customers with their inquiries and resolving issues efficiently.",
    tonality: "professional",
    language: "en-US",
    fallbackLanguages: ["en", "es-US"],
  },
  capabilities: {
    llm: {
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 4096,
    },
    tts: {
      providers: ["azure", "elevenlabs"],
      voice: "professional_female",
      speed: 1.0,
    },
    stt: {
      providers: ["azure", "openai"],
      language: "en-US",
    },
    memory: {
      shortTermLimit: 20,
      longTermEnabled: true,
      personalDataRetention: "30d",
    },
  },
  tools: [
    {
      name: "knowledge_search",
      type: "function",
      description: "Search internal knowledge base for customer support information",
    },
    {
      name: "ticket_system",
      type: "api",
      endpoint: "https://api.company.com/tickets",
      authentication: { type: "apikey" },
      description: "Create and manage customer support tickets",
    },
  ],
  knowledge: {
    sources: [
      { name: "Product Documentation", type: "document", uri: "docs://product-knowledge" },
      { name: "FAQ Database", type: "database", uri: "db://faq-collection" },
    ],
    ragProfile: { chunkSize: 512, retrievalLimit: 5, similarityThreshold: 0.7 },
  },
  deployment: {
    channels: ["web", "teams", "whatsapp"],
    regions: ["us", "eu"],
    scaling: { maxConcurrent: 100, autoScale: true },
  },
  compliance: {
    piiHandling: "standard",
    dataResidency: ["us", "eu"],
    retentionPolicy: "30d",
    auditLevel: "detailed",
  },
  economics: {
    budgetLimits: { daily: 50.0, monthly: 1000.0 },
    costPerTask: { target: 0.25, maximum: 1.0 },
    throttling: { enabled: true, requestsPerMinute: 30 },
  },
} as const;