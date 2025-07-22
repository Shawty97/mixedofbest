
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SemanticSearchRequest {
  query: string;
  knowledgeBaseIds: string[];
  limit?: number;
  threshold?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { 
      query, 
      knowledgeBaseIds, 
      limit = 10, 
      threshold = 0.7 
    }: SemanticSearchRequest = await req.json()

    // Generate embedding for the query
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    })

    const embeddingData = await embeddingResponse.json()
    
    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingData.error?.message}`)
    }

    const queryEmbedding = embeddingData.data[0].embedding

    // Search for similar chunks
    const { data: matches, error } = await supabase
      .rpc('match_chunks', {
        query_embedding: queryEmbedding,
        knowledge_base_ids: knowledgeBaseIds,
        match_threshold: threshold,
        match_count: limit
      })

    if (error) {
      throw new Error(`Search error: ${error.message}`)
    }

    // Enrich results with document information
    const enrichedMatches = await Promise.all(
      (matches || []).map(async (match: any) => {
        const { data: document } = await supabase
          .from('knowledge_documents')
          .select('filename, metadata')
          .eq('id', match.document_id)
          .single()

        return {
          ...match,
          document_filename: document?.filename,
          document_metadata: document?.metadata
        }
      })
    )

    return new Response(
      JSON.stringify({
        query,
        matches: enrichedMatches,
        total_matches: enrichedMatches.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Semantic search error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
