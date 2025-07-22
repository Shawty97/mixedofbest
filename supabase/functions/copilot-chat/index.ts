
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface ChatRequest {
  message: string;
  sessionId?: string;
  sessionType: 'workflow_help' | 'debugging' | 'optimization' | 'code_generation' | 'general';
  context?: any;
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'claude-3-haiku';
}

interface ChatResponse {
  response: string;
  sessionId: string;
  suggestions?: any[];
  metadata: {
    tokensUsed: number;
    cost: number;
    processingTime: number;
    model: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, sessionId, sessionType, context, model = 'gpt-4' }: ChatRequest = await req.json()

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const startTime = Date.now()

    // Create or get session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('copilot_sessions')
        .insert({
          user_id: user.id,
          session_type: sessionType,
          context: context || {}
        })
        .select()
        .single()

      if (sessionError) throw sessionError
      currentSessionId = newSession.id
    }

    // Get session history for context
    const { data: messageHistory, error: historyError } = await supabaseClient
      .from('copilot_messages')
      .select('message_type, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    if (historyError) throw historyError

    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(sessionType, context, messageHistory)

    // Call AI service
    const aiResponse = await callAIService(model, systemPrompt, message, messageHistory)
    
    const processingTime = Date.now() - startTime

    // Save user message
    await supabaseClient
      .from('copilot_messages')
      .insert({
        session_id: currentSessionId,
        message_type: 'user',
        content: message,
        metadata: { context }
      })

    // Save AI response
    await supabaseClient
      .from('copilot_messages')
      .insert({
        session_id: currentSessionId,
        message_type: 'assistant',
        content: aiResponse.content,
        metadata: aiResponse.metadata,
        tokens_used: aiResponse.tokensUsed,
        processing_time: processingTime,
        model_used: model
      })

    // Update session statistics
    await supabaseClient
      .from('copilot_sessions')
      .update({
        total_messages: messageHistory.length + 2,
        total_tokens: (messageHistory.reduce((sum, msg) => sum + (msg.metadata?.tokens_used || 0), 0)) + aiResponse.tokensUsed,
        session_cost: calculateCost(model, aiResponse.tokensUsed)
      })
      .eq('id', currentSessionId)

    // Generate code suggestions if applicable
    const suggestions = await generateCodeSuggestions(aiResponse.content, sessionType, context, user.id, currentSessionId, supabaseClient)

    const response: ChatResponse = {
      response: aiResponse.content,
      sessionId: currentSessionId,
      suggestions,
      metadata: {
        tokensUsed: aiResponse.tokensUsed,
        cost: calculateCost(model, aiResponse.tokensUsed),
        processingTime,
        model
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Copilot chat error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildSystemPrompt(sessionType: string, context: any, messageHistory: any[]): string {
  const basePrompt = `You are an AI Copilot assistant for the AImpact platform, specializing in AI workflow development and automation.`
  
  const typeSpecificPrompts = {
    workflow_help: `You help users create, modify, and optimize AI workflows. Focus on practical solutions and best practices.`,
    debugging: `You help diagnose and fix workflow issues. Analyze errors systematically and provide step-by-step solutions.`,
    optimization: `You analyze workflows for performance, cost, and efficiency improvements. Provide specific, actionable recommendations.`,
    code_generation: `You generate high-quality code for workflow nodes, integrations, and custom functions. Follow best practices and security guidelines.`,
    general: `You provide general assistance with the AImpact platform and AI development concepts.`
  }

  let contextInfo = ''
  if (context) {
    contextInfo = `\n\nCurrent context: ${JSON.stringify(context, null, 2)}`
  }

  return `${basePrompt}\n\n${typeSpecificPrompts[sessionType] || typeSpecificPrompts.general}${contextInfo}\n\nBe helpful, accurate, and provide actionable solutions.`
}

async function callAIService(model: string, systemPrompt: string, userMessage: string, messageHistory: any[]): Promise<{
  content: string;
  tokensUsed: number;
  metadata: any;
}> {
  const apiKey = model.startsWith('gpt-') 
    ? Deno.env.get('OPENAI_API_KEY')
    : Deno.env.get('ANTHROPIC_API_KEY')

  if (!apiKey) {
    throw new Error(`API key not configured for model: ${model}`)
  }

  if (model.startsWith('gpt-')) {
    return await callOpenAI(model, systemPrompt, userMessage, messageHistory, apiKey)
  } else {
    return await callAnthropic(model, systemPrompt, userMessage, messageHistory, apiKey)
  }
}

async function callOpenAI(model: string, systemPrompt: string, userMessage: string, messageHistory: any[], apiKey: string) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...messageHistory.map(msg => ({
      role: msg.message_type === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API request failed')
  }

  const data = await response.json()
  
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage.total_tokens,
    metadata: { model, provider: 'openai' }
  }
}

async function callAnthropic(model: string, systemPrompt: string, userMessage: string, messageHistory: any[], apiKey: string) {
  const messages = [
    ...messageHistory.map(msg => ({
      role: msg.message_type === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: systemPrompt,
      messages
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Anthropic API request failed')
  }

  const data = await response.json()
  
  return {
    content: data.content[0].text,
    tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
    metadata: { model, provider: 'anthropic' }
  }
}

async function generateCodeSuggestions(aiResponse: string, sessionType: string, context: any, userId: string, sessionId: string, supabaseClient: any) {
  // Only generate suggestions for relevant session types
  if (!['debugging', 'optimization', 'code_generation'].includes(sessionType)) {
    return []
  }

  const suggestions = []

  // Parse AI response for actionable suggestions
  const codeBlocks = aiResponse.match(/```[\s\S]*?```/g) || []
  const optimizationKeywords = ['optimize', 'improve', 'faster', 'efficient', 'reduce cost']
  const hasOptimizations = optimizationKeywords.some(keyword => 
    aiResponse.toLowerCase().includes(keyword)
  )

  if (codeBlocks.length > 0) {
    for (const codeBlock of codeBlocks) {
      const suggestion = {
        user_id: userId,
        session_id: sessionId,
        suggestion_type: sessionType === 'debugging' ? 'fix' : 'enhancement',
        context: context || {},
        suggestion_data: {
          type: 'code',
          content: codeBlock,
          description: 'AI-generated code solution',
          language: detectLanguage(codeBlock)
        },
        confidence_score: 0.85
      }

      const { data } = await supabaseClient
        .from('code_suggestions')
        .insert(suggestion)
        .select()
        .single()

      suggestions.push(data)
    }
  }

  if (hasOptimizations && sessionType === 'optimization') {
    const suggestion = {
      user_id: userId,
      session_id: sessionId,
      suggestion_type: 'optimization',
      context: context || {},
      suggestion_data: {
        type: 'optimization',
        recommendations: extractOptimizationRecommendations(aiResponse),
        description: 'Performance and cost optimization suggestions'
      },
      confidence_score: 0.75
    }

    const { data } = await supabaseClient
      .from('code_suggestions')
      .insert(suggestion)
      .select()
      .single()

    suggestions.push(data)
  }

  return suggestions
}

function detectLanguage(codeBlock: string): string {
  const firstLine = codeBlock.split('\n')[0].toLowerCase()
  if (firstLine.includes('javascript') || firstLine.includes('js')) return 'javascript'
  if (firstLine.includes('typescript') || firstLine.includes('ts')) return 'typescript'
  if (firstLine.includes('python') || firstLine.includes('py')) return 'python'
  if (firstLine.includes('sql')) return 'sql'
  if (firstLine.includes('json')) return 'json'
  return 'text'
}

function extractOptimizationRecommendations(response: string): string[] {
  const recommendations = []
  const lines = response.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') && (
      trimmed.includes('optimize') || 
      trimmed.includes('improve') || 
      trimmed.includes('reduce') ||
      trimmed.includes('faster')
    )) {
      recommendations.push(trimmed.substring(2))
    }
  }
  
  return recommendations
}

function calculateCost(model: string, tokens: number): number {
  const costs: Record<string, number> = {
    'gpt-4': 0.00003,
    'gpt-3.5-turbo': 0.000002,
    'claude-3-sonnet': 0.000015,
    'claude-3-haiku': 0.00000025
  }
  return (costs[model] || 0.00003) * tokens
}

