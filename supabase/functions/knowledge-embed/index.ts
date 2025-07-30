import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmbedRequest {
  text: string;
  title?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { text, title, metadata }: EmbedRequest = await req.json();

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create document
    const { data: document, error: docError } = await supabase
      .from('knowledge_documents')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Document',
        content: text,
        status: 'processing',
        metadata: metadata || {},
      })
      .select()
      .single();

    if (docError) {
      throw docError;
    }

    // Chunk text (simple implementation - split by sentences)
    const chunks = text.split(/[.!?]+/).filter(chunk => chunk.trim().length > 10);

    // Generate embeddings for each chunk
    const chunkPromises = chunks.map(async (chunk, index) => {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: chunk.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      const embedding = result.data[0].embedding;

      // Insert chunk with embedding
      const { error: chunkError } = await supabase
        .from('knowledge_chunks')
        .insert({
          document_id: document.id,
          content: chunk.trim(),
          embedding: embedding,
          position: index,
          metadata: {},
        });

      if (chunkError) {
        throw chunkError;
      }

      return { index, success: true };
    });

    await Promise.all(chunkPromises);

    // Update document status
    await supabase
      .from('knowledge_documents')
      .update({ status: 'completed' })
      .eq('id', document.id);

    return new Response(
      JSON.stringify({
        document_id: document.id,
        chunks_created: chunks.length,
        status: 'completed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});