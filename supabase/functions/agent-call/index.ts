import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallRequest {
  agent_id: string;
  phone_number?: string;
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

    const { agent_id, phone_number, metadata }: CallRequest = await req.json();

    // Get agent configuration
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent_id)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create agent call record
    const { data: call, error: callError } = await supabase
      .from('agent_calls')
      .insert({
        agent_id: agent_id,
        user_id: user.id,
        status: 'starting',
        metadata: {
          phone_number,
          ...metadata,
          agent_config: {
            name: agent.name,
            voice_provider: agent.voice_provider,
            voice_id: agent.voice_id,
            stt_provider: agent.stt_provider,
            tts_provider: agent.tts_provider,
            instructions: agent.instructions,
          },
        },
      })
      .select()
      .single();

    if (callError) {
      throw callError;
    }

    // Simulate agent execution (in real implementation, this would start a LiveKit session)
    // For now, we'll just update the status to simulate progression
    setTimeout(async () => {
      await supabase
        .from('agent_calls')
        .update({ status: 'connected' })
        .eq('id', call.id);
    }, 2000);

    // Simulate call end after 30 seconds
    setTimeout(async () => {
      await supabase
        .from('agent_calls')
        .update({ 
          status: 'ended',
          duration: 30,
          ended_at: new Date().toISOString(),
        })
        .eq('id', call.id);
    }, 32000);

    return new Response(
      JSON.stringify({
        call_id: call.id,
        status: 'starting',
        agent_name: agent.name,
        message: 'Agent call initiated successfully',
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