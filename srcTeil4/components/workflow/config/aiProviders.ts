
export const aiProviders = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI provides powerful, state-of-the-art language models.',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most advanced OpenAI model with multimodal capabilities',
        costPer1KTokens: 0.015,
        maxTokens: 128000,
        latencyMs: 400,
        capabilities: ['Text Generation', 'Code', 'Reasoning', 'Vision'],
        versions: [
          {
            id: 'gpt-4o-2024-05',
            name: 'May 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'May 13, 2024',
            description: 'Latest stable version with improved reasoning and coding abilities'
          },
          {
            id: 'gpt-4o-2024-03',
            name: 'March 2024',
            isDefault: false,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'March 16, 2024',
            description: 'Initial GPT-4o release with strong multimodal capabilities'
          }
        ]
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Efficient and cost-effective with strong capabilities',
        costPer1KTokens: 0.005,
        maxTokens: 128000,
        latencyMs: 200,
        capabilities: ['Text Generation', 'Code', 'Reasoning', 'Vision'],
        versions: [
          {
            id: 'gpt-4o-mini-2024-04',
            name: 'April 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'April 9, 2024',
            description: 'Balanced performance and efficiency with multimodal capabilities'
          }
        ]
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient language model for most tasks',
        costPer1KTokens: 0.0015,
        maxTokens: 16385,
        latencyMs: 100,
        capabilities: ['Text Generation', 'Code', 'Basic Reasoning'],
        versions: [
          {
            id: 'gpt-3.5-turbo-0125',
            name: 'January 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'January 25, 2024',
            description: 'Latest version with improved instruction following'
          },
          {
            id: 'gpt-3.5-turbo-1106',
            name: 'November 2023',
            isDefault: false,
            isStable: true,
            isDeprecated: true,
            releaseDate: 'November 6, 2023',
            description: 'Older version with 16k context window'
          }
        ]
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Anthropic offers Claude models focused on safety and helpfulness.',
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Most powerful Claude model with exceptional understanding',
        costPer1KTokens: 0.025,
        maxTokens: 200000,
        latencyMs: 600,
        capabilities: ['Text Generation', 'Code', 'Advanced Reasoning', 'Vision'],
        versions: [
          {
            id: 'claude-3-opus-20240229',
            name: 'February 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'February 29, 2024',
            description: 'Initial release with exceptional reasoning and vision capabilities'
          }
        ]
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Balanced performance and efficiency for most tasks',
        costPer1KTokens: 0.015,
        maxTokens: 200000,
        latencyMs: 300,
        capabilities: ['Text Generation', 'Code', 'Reasoning', 'Vision'],
        versions: [
          {
            id: 'claude-3-sonnet-20240229',
            name: 'February 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'February 29, 2024',
            description: 'Balanced model for most enterprise applications'
          }
        ]
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Fast and cost-effective model for straightforward tasks',
        costPer1KTokens: 0.0025,
        maxTokens: 200000,
        latencyMs: 100,
        capabilities: ['Text Generation', 'Code', 'Basic Reasoning', 'Vision'],
        versions: [
          {
            id: 'claude-3-haiku-20240307',
            name: 'March 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'March 7, 2024',
            description: 'Fastest Claude model with strong performance and low latency'
          }
        ]
      }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral AI offers efficient, open models with impressive capabilities.',
    models: [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large',
        description: 'Advanced model with strong reasoning and instruction following',
        costPer1KTokens: 0.008,
        maxTokens: 32768,
        latencyMs: 300,
        capabilities: ['Text Generation', 'Code', 'Reasoning'],
        versions: [
          {
            id: 'mistral-large-2405',
            name: 'May 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'May 2024',
            description: 'Latest version with improved reasoning capabilities'
          },
          {
            id: 'mistral-large-2402',
            name: 'February 2024',
            isDefault: false,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'February 2024',
            description: 'Initial release of Mistral Large'
          }
        ]
      },
      {
        id: 'mistral-medium-latest',
        name: 'Mistral Medium',
        description: 'Balanced model for most general use cases',
        costPer1KTokens: 0.0027,
        maxTokens: 32768,
        latencyMs: 200,
        capabilities: ['Text Generation', 'Code', 'Basic Reasoning'],
        versions: [
          {
            id: 'mistral-medium-2402',
            name: 'February 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'February 2024',
            description: 'Well-balanced model for most applications'
          }
        ]
      },
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small',
        description: 'Efficient model for straightforward tasks',
        costPer1KTokens: 0.0006,
        maxTokens: 32768,
        latencyMs: 100,
        capabilities: ['Text Generation', 'Simple Code'],
        versions: [
          {
            id: 'mistral-small-2402',
            name: 'February 2024',
            isDefault: true,
            isStable: true,
            isDeprecated: false,
            releaseDate: 'February 2024',
            description: 'Fast and efficient model for simple tasks'
          }
        ]
      }
    ]
  }
];
