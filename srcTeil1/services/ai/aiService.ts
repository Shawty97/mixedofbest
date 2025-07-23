
import { toast } from '@/hooks/use-toast';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokensUsed?: number;
    cost?: number;
    model?: string;
    processingTime?: number;
  };
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  context?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  metadata: {
    tokensUsed: number;
    cost: number;
    model: string;
    processingTime: number;
  };
}

export interface AIServiceConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  defaultModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'claude-3-haiku';
  maxTokens: number;
  temperature: number;
}

class AIService {
  private config: AIServiceConfig;
  private conversations: Map<string, AIConversation> = new Map();

  constructor() {
    this.config = {
      defaultModel: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7
    };
    this.loadApiKeys();
  }

  private loadApiKeys() {
    // Load from environment or localStorage
    this.config.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || undefined;
    this.config.anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key') || undefined;
  }

  setApiKey(provider: 'openai' | 'anthropic', apiKey: string) {
    if (provider === 'openai') {
      this.config.openaiApiKey = apiKey;
      localStorage.setItem('openai_api_key', apiKey);
    } else {
      this.config.anthropicApiKey = apiKey;
      localStorage.setItem('anthropic_api_key', apiKey);
    }
  }

  async sendMessage(
    conversationId: string,
    message: string,
    options?: {
      model?: string;
      systemPrompt?: string;
      context?: Record<string, any>;
    }
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Get or create conversation
      let conversation = this.conversations.get(conversationId);
      if (!conversation) {
        conversation = {
          id: conversationId,
          title: message.slice(0, 50) + '...',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          model: options?.model || this.config.defaultModel,
          context: options?.context
        };
        this.conversations.set(conversationId, conversation);
      }

      // Add user message
      const userMessage: AIMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      conversation.messages.push(userMessage);

      // Prepare messages for API
      const messages = [...conversation.messages];
      
      // Add system prompt if provided
      if (options?.systemPrompt) {
        messages.unshift({
          role: 'system',
          content: options.systemPrompt,
          timestamp: new Date()
        });
      }

      // Call appropriate AI service
      const response = await this.callAIService(
        options?.model || this.config.defaultModel,
        messages,
        options?.context
      );

      // Add assistant response
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata
      };
      conversation.messages.push(assistantMessage);
      conversation.updatedAt = new Date();

      // Save conversation
      await this.saveConversation(conversation);

      return response;

    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async callAIService(
    model: string,
    messages: AIMessage[],
    context?: Record<string, any>
  ): Promise<AIResponse> {
    const startTime = Date.now();

    if (model.startsWith('gpt-')) {
      return await this.callOpenAI(model, messages, context);
    } else if (model.startsWith('claude-')) {
      return await this.callAnthropic(model, messages, context);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  }

  private async callOpenAI(
    model: string,
    messages: AIMessage[],
    context?: Record<string, any>
  ): Promise<AIResponse> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.openaiApiKey}`
      },
      body: JSON.stringify({
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    return {
      content: data.choices[0].message.content,
      metadata: {
        tokensUsed: data.usage.total_tokens,
        cost: this.calculateOpenAICost(model, data.usage.total_tokens),
        model,
        processingTime
      }
    };
  }

  private async callAnthropic(
    model: string,
    messages: AIMessage[],
    context?: Record<string, any>
  ): Promise<AIResponse> {
    if (!this.config.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const startTime = Date.now();

    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: this.config.maxTokens,
        system: systemMessage,
        messages: conversationMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API request failed');
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    return {
      content: data.content[0].text,
      metadata: {
        tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
        cost: this.calculateAnthropicCost(model, data.usage.input_tokens + data.usage.output_tokens),
        model,
        processingTime
      }
    };
  }

  private calculateOpenAICost(model: string, tokens: number): number {
    const costs: Record<string, number> = {
      'gpt-4': 0.00003,
      'gpt-3.5-turbo': 0.000002
    };
    return (costs[model] || 0.00003) * tokens;
  }

  private calculateAnthropicCost(model: string, tokens: number): number {
    const costs: Record<string, number> = {
      'claude-3-sonnet': 0.000015,
      'claude-3-haiku': 0.00000025
    };
    return (costs[model] || 0.000015) * tokens;
  }

  async saveConversation(conversation: AIConversation): Promise<void> {
    try {
      // Save to localStorage first
      const conversations = this.getAllConversations();
      conversations.set(conversation.id, conversation);
      localStorage.setItem('ai_conversations', JSON.stringify(Array.from(conversations.entries())));

      // TODO: Save to Supabase when available
      console.log('Conversation saved:', conversation.id);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  getAllConversations(): Map<string, AIConversation> {
    try {
      const stored = localStorage.getItem('ai_conversations');
      if (stored) {
        const entries = JSON.parse(stored);
        return new Map(entries.map(([id, conv]: [string, any]) => [
          id,
          {
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }
        ]));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
    return new Map();
  }

  getConversation(conversationId: string): AIConversation | undefined {
    return this.getAllConversations().get(conversationId);
  }

  deleteConversation(conversationId: string): void {
    const conversations = this.getAllConversations();
    conversations.delete(conversationId);
    localStorage.setItem('ai_conversations', JSON.stringify(Array.from(conversations.entries())));
    this.conversations.delete(conversationId);
  }

  clearAllConversations(): void {
    localStorage.removeItem('ai_conversations');
    this.conversations.clear();
  }

  // Command processing for the copilot
  async processCommand(
    command: string,
    context?: {
      currentWorkflow?: any;
      selectedNodes?: string[];
      workspaceData?: any;
    }
  ): Promise<{
    type: 'code' | 'ui' | 'workflow' | 'general';
    result: string;
    actions?: Array<{
      type: string;
      data: any;
    }>;
  }> {
    const commandType = this.detectCommandType(command);
    const systemPrompt = this.getSystemPromptForType(commandType, context);

    const conversationId = `command_${Date.now()}`;
    const response = await this.sendMessage(conversationId, command, {
      systemPrompt,
      context
    });

    // Parse response for actions
    const actions = this.parseActionsFromResponse(response.content);

    return {
      type: commandType,
      result: response.content,
      actions
    };
  }

  private detectCommandType(command: string): 'code' | 'ui' | 'workflow' | 'general' {
    const lower = command.toLowerCase();
    
    if (lower.includes('workflow') || lower.includes('node') || lower.includes('connect')) {
      return 'workflow';
    }
    if (lower.includes('code') || lower.includes('function') || lower.includes('component')) {
      return 'code';
    }
    if (lower.includes('ui') || lower.includes('design') || lower.includes('interface')) {
      return 'ui';
    }
    
    return 'general';
  }

  private getSystemPromptForType(type: string, context?: any): string {
    const basePrompt = `You are an AI assistant specializing in ${type}. Provide helpful, accurate responses.`;
    
    switch (type) {
      case 'workflow':
        return `${basePrompt} You help users create and manage AI workflows. Current context: ${JSON.stringify(context?.currentWorkflow || {})}`;
      case 'code':
        return `${basePrompt} You write clean, efficient code following best practices. Focus on React, TypeScript, and modern web development.`;
      case 'ui':
        return `${basePrompt} You design user interfaces using Tailwind CSS and modern UI patterns. Focus on accessibility and user experience.`;
      default:
        return basePrompt;
    }
  }

  private parseActionsFromResponse(response: string): Array<{ type: string; data: any }> {
    const actions: Array<{ type: string; data: any }> = [];
    
    // Look for action patterns in the response
    const actionPatterns = [
      /CREATE_NODE:\s*({[^}]+})/g,
      /UPDATE_WORKFLOW:\s*({[^}]+})/g,
      /RUN_CODE:\s*```([^`]+)```/g
    ];

    actionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        try {
          const data = match[1].startsWith('{') ? JSON.parse(match[1]) : { code: match[1] };
          actions.push({
            type: pattern.source.split(':')[0],
            data
          });
        } catch (error) {
          console.warn('Failed to parse action:', match[1]);
        }
      }
    });

    return actions;
  }
}

export const aiService = new AIService();
