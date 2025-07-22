
import { useState, useEffect } from 'react';

type Voice = {
  voice_id: string;
  name: string;
};

const API_URL = 'https://api.elevenlabs.io/v1';
const STORAGE_KEY = 'elevenlabs_api_key';

export const useElevenLabs = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Save API key to localStorage
  const saveApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setError(null);
  };

  // Clear API key from localStorage
  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
  };

  // Fetch available voices
  const fetchVoices = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/voices`, {
        headers: {
          'xi-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      const data = await response.json();
      setVoices(data.voices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Text-to-speech conversion
  const textToSpeech = async (text: string, voiceId: string) => {
    if (!apiKey) {
      setError('API key is required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    apiKey,
    voices,
    loading,
    error,
    saveApiKey,
    clearApiKey,
    fetchVoices,
    textToSpeech,
    hasApiKey: !!apiKey,
  };
};

export default useElevenLabs;
