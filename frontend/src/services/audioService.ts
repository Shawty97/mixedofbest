import { supabase } from '@/integrations/supabase/client';

interface AudioProcessParams {
  audio_data: string; // base64 encoded audio
  provider: 'openai' | 'elevenlabs' | 'deepgram';
  operation: 'stt' | 'tts';
  voice_id?: string;
  text?: string;
}

export const audioAPI = {
  // Convert speech to text
  speechToText: async (audioData: string, provider: 'openai' | 'deepgram' = 'openai') => {
    const { data, error } = await supabase.functions.invoke('audio-process', {
      body: {
        audio_data: audioData,
        provider,
        operation: 'stt'
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Convert text to speech
  textToSpeech: async (text: string, provider: 'elevenlabs' | 'openai' = 'elevenlabs', voiceId?: string) => {
    const { data, error } = await supabase.functions.invoke('audio-process', {
      body: {
        text,
        provider,
        operation: 'tts',
        voice_id: voiceId
      }
    });
    
    if (error) throw error;
    return data;
  }
};