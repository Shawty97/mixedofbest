
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentProcessRequest {
  documentId: string;
  fileContent: string;
  contentType: string;
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

    const { documentId, fileContent, contentType }: DocumentProcessRequest = await req.json()

    // Extract text based on content type
    let extractedText = ''
    
    if (contentType === 'text/plain') {
      extractedText = fileContent
    } else if (contentType === 'application/pdf') {
      // In a real implementation, you'd use a PDF parsing library
      extractedText = 'PDF content extraction would happen here'
    } else {
      throw new Error('Unsupported content type')
    }

    // Chunk the text
    const chunks = chunkText(extractedText, 500, 50) // 500 chars per chunk, 50 char overlap

    // Generate embeddings for each chunk
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const chunkPromises = chunks.map(async (chunk, index) => {
      // Generate embedding
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: chunk.text,
        }),
      })

      const embeddingData = await embeddingResponse.json()
      
      if (!embeddingResponse.ok) {
        throw new Error(`OpenAI API error: ${embeddingData.error?.message}`)
      }

      return {
        document_id: documentId,
        chunk_text: chunk.text,
        chunk_index: index,
        embedding: embeddingData.data[0].embedding,
        metadata: {
          start_char: chunk.start,
          end_char: chunk.end,
          word_count: chunk.text.split(' ').length
        }
      }
    })

    // Wait for all embeddings to be generated
    const chunksWithEmbeddings = await Promise.all(chunkPromises)

    // Insert chunks into database
    const { error: chunksError } = await supabase
      .from('knowledge_chunks')
      .insert(chunksWithEmbeddings)

    if (chunksError) {
      throw new Error(`Failed to insert chunks: ${chunksError.message}`)
    }

    // Update document status
    await supabase
      .from('knowledge_documents')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', documentId)

    // Extract entities and relationships (simplified)
    const entities = await extractEntities(extractedText)
    const relationships = await extractRelationships(extractedText, entities)

    return new Response(
      JSON.stringify({
        success: true,
        chunks_created: chunksWithEmbeddings.length,
        entities_found: entities.length,
        relationships_found: relationships.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Document processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function chunkText(text: string, chunkSize: number, overlap: number): Array<{text: string, start: number, end: number}> {
  const chunks = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    
    chunks.push({
      text: chunk,
      start,
      end
    })

    if (end === text.length) break
    start = end - overlap
  }

  return chunks
}

async function extractEntities(text: string): Promise<any[]> {
  // Simplified entity extraction - in a real implementation,
  // you'd use NLP libraries or AI models
  const entities = []
  
  // Simple regex patterns for demonstration
  const patterns = {
    person: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
    organization: /\b[A-Z][a-z]+ (?:Inc|LLC|Corp|Company|GmbH)\b/g,
    location: /\b[A-Z][a-z]+(?:, [A-Z][a-z]+)*\b/g
  }

  for (const [type, pattern] of Object.entries(patterns)) {
    const matches = text.match(pattern) || []
    matches.forEach(match => {
      entities.push({
        name: match,
        type,
        confidence: 0.8
      })
    })
  }

  return entities
}

async function extractRelationships(text: string, entities: any[]): Promise<any[]> {
  // Simplified relationship extraction
  const relationships = []
  
  // Look for entities that appear near each other
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const entity1 = entities[i]
      const entity2 = entities[j]
      
      // Check if entities appear in the same sentence
      const sentences = text.split(/[.!?]+/)
      for (const sentence of sentences) {
        if (sentence.includes(entity1.name) && sentence.includes(entity2.name)) {
          relationships.push({
            from: entity1.name,
            to: entity2.name,
            type: 'mentioned_together',
            confidence: 0.6
          })
          break
        }
      }
    }
  }

  return relationships
}
