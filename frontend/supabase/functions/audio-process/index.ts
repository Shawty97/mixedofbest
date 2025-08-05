import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AudioRequest {
  audio_data: string; // base64 encoded audio
  provider: 'openai' | 'elevenlabs' | 'deepgram';
  operation: 'stt' | 'tts';
  voice_id?: string;
  text?: string;
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

    const { audio_data, provider, operation, voice_id, text }: AudioRequest = await req.json();

    if (operation === 'stt') {
      // Speech-to-Text
      if (provider === 'openai') {
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
          throw new Error('OpenAI API key not configured');
        }

        // Convert base64 to blob
        const audioBuffer = Uint8Array.from(atob(audio_data), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`OpenAI STT error: ${response.statusText}`);
        }

        const result = await response.json();
        return new Response(
          JSON.stringify({ transcription: result.text }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (operation === 'tts') {
      // Text-to-Speech
      if (provider === 'elevenlabs') {
        const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
        if (!elevenlabsApiKey) {
          throw new Error('ElevenLabs API key not configured');
        }

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id || 'pNInz6obpgDQGcFmaJgB'}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${elevenlabsApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs TTS error: ${response.statusText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

        return new Response(
          JSON.stringify({ audio_data: audioBase64 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (provider === 'openai') {
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
          throw new Error('OpenAI API key not configured');
        }

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'alloy',
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI TTS error: ${response.statusText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

        return new Response(
          JSON.stringify({ audio_data: audioBase64 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Unsupported provider or operation' }),
      {
        status: 400,
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