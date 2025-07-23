import { useState, useEffect, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, Mic, MicOff, Play, Square, Phone, PhoneOff } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { VoiceAgentsService } from '@/services/voice-agents-service';

type VoiceConversationProps = {
  agentName?: string;
  voiceId?: string;
  apiKey?: string;
  onConversationStart?: () => void;
  onConversationEnd?: () => void;
  systemPrompt?: string;
}

export function VoiceConversation({ 
  agentName = "Voice Agent",
  voiceId = "EXAVITQu4vr4xnSDxMaL", // Sarah by default
  apiKey,
  onConversationStart,
  onConversationEnd,
  systemPrompt = "You are a helpful AI assistant. Speak naturally and be conversational."
}: VoiceConversationProps) {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{role: string, text: string, timestamp: Date}>>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [useLocalKey, setUseLocalKey] = useState(false);
  
  // Check for local ElevenLabs API key
  useEffect(() => {
    const localKey = localStorage.getItem('elevenlabs_api_key');
    if (localKey && !apiKey) {
      setUseLocalKey(true);
    }
  }, [apiKey]);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('🎙️ Connected to ElevenLabs');
      toast({
        title: "Connected",
        description: "Voice conversation is now active"
      });
      onConversationStart?.();
      setIsConnecting(false);
    },
    onDisconnect: () => {
      console.log('🔌 Disconnected from ElevenLabs');
      setConversationId(null);
      setIsConnecting(false);
      toast({
        title: "Disconnected",
        description: "Voice conversation ended"
      });
      onConversationEnd?.();
    },
    onMessage: (message) => {
      console.log('📨 Message received:', message);
      
      if (message.source === 'user') {
        setMessages(prev => [...prev, {
          role: 'user',
          text: message.message,
          timestamp: new Date()
        }]);
      } else if (message.source === 'ai') {
        setMessages(prev => [...prev, {
          role: 'agent',
          text: message.message,
          timestamp: new Date()
        }]);
      }
    },
    onError: (error: any) => {
      console.error('🔴 ElevenLabs error:', error);
      let errorMessage = "Something went wrong with the voice connection";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Voice Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsConnecting(false);
    },
    overrides: {
      agent: {
        prompt: {
          prompt: systemPrompt,
        },
        firstMessage: `Hello! I'm ${agentName}. How can I help you today?`,
        language: "en",
      },
      tts: {
        voiceId: voiceId
      },
    }
  });

  const getEffectiveApiKey = () => {
    return apiKey || (useLocalKey ? localStorage.getItem('elevenlabs_api_key') : null);
  };

  const startConversation = async () => {
    const effectiveApiKey = getEffectiveApiKey();
    
    if (!effectiveApiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your ElevenLabs API key to start a conversation",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a temporary agent for this conversation
      const createAgentResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
        method: 'POST',
        headers: {
          'xi-api-key': effectiveApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentName,
          prompt: systemPrompt,
          first_message: `Hello! I'm ${agentName}. How can I help you today?`,
          voice_id: voiceId,
          language: "en"
        }),
      });

      if (!createAgentResponse.ok) {
        throw new Error(`Failed to create agent: ${createAgentResponse.statusText}`);
      }

      const agentData = await createAgentResponse.json();
      const tempAgentId = agentData.agent_id;
      setAgentId(tempAgentId);
      
      // Start conversation with the created agent
      const id = await conversation.startSession({ 
        agentId: tempAgentId,
        authorization: `Bearer ${effectiveApiKey}`
      });
      
      setConversationId(id);
      console.log('🚀 Conversation started with ID:', id);
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      const errorMessage = error instanceof Error ? error.message : "Could not connect to voice service";
      
      // Fallback to demo mode if API fails
      if (!apiKey && useLocalKey) {
        toast({
          title: "Switching to Demo Mode",
          description: "Voice API unavailable, using simulated conversation",
        });
        setIsConnecting(false);
        // Simulate demo conversation
        setTimeout(() => {
          setConversationId('demo-conversation');
          onConversationStart?.();
        }, 1000);
      } else {
        toast({
          title: "Connection Failed",
          description: errorMessage,
          variant: "destructive"
        });
        setIsConnecting(false);
      }
    }
  };

  const endConversation = async () => {
    try {
      if (conversationId === 'demo-conversation') {
        // Demo mode cleanup
        setMessages([]);
        setConversationId(null);
        onConversationEnd?.();
        return;
      }
      
      await conversation.endSession();
      setMessages([]);
      
      // Clean up the temporary agent
      const effectiveApiKey = getEffectiveApiKey();
      if (agentId && effectiveApiKey) {
        try {
          await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
            method: 'DELETE',
            headers: {
              'xi-api-key': effectiveApiKey,
            },
          });
        } catch (error) {
          console.error('Failed to cleanup temporary agent:', error);
        }
      }
      setAgentId(null);
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const newVolume = isMuted ? volume : 0;
    conversation.setVolume({ volume: newVolume / 100 });
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (!isMuted) {
      conversation.setVolume({ volume: newVolume / 100 });
    }
    
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: "Conversation Cleared",
      description: "Message history has been reset",
    });
  };

  // Update volume when conversation is active
  useEffect(() => {
    if (conversation.status === 'connected' && !isMuted) {
      conversation.setVolume({ volume: volume / 100 });
    }
  }, [volume, isMuted, conversation]);

  const isConnected = conversation.status === 'connected' || conversationId === 'demo-conversation';
  const isSpeaking = conversation.isSpeaking;
  const hasApiKey = !!getEffectiveApiKey();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>{agentName}</span>
            {isConnected ? (
              <Badge variant="outline" className="ml-2 text-green-600 bg-green-50 dark:bg-green-900/20">
                {conversationId === 'demo-conversation' ? '🎭 Demo Mode' : 
                 isSpeaking ? '🎙️ Speaking' : '👂 Listening'}
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 text-gray-600 bg-gray-50 dark:bg-gray-900/20">
                Offline
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasApiKey && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                API Ready
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
              disabled={!isConnected}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={100}
              step={1}
              className="w-24"
              onValueChange={handleVolumeChange}
              disabled={!isConnected}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className={`rounded-lg p-3 text-center ${
          isConnected 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : hasApiKey
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
        }`}>
          {isConnecting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Connecting...
            </span>
          ) : isConnected ? (
            <span>
              {conversationId === 'demo-conversation' 
                ? '🎭 Demo conversation active - Features simulated!' 
                : '🎙️ Voice conversation active - Speak naturally!'}
            </span>
          ) : hasApiKey ? (
            <span>📞 Ready to connect - Click "Start Call" to begin</span>
          ) : (
            <span>🔑 API key required for voice features - Set up in settings</span>
          )}
        </div>

        {/* Conversation History */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div 
                key={index}
                className={`rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-50 ml-8 dark:bg-blue-900/20' 
                    : 'bg-gray-50 mr-8 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'You' : agentName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No conversation yet. Start a call to begin!
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearConversation}
            >
              Clear History
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center gap-4">
        <Button
          variant={isConnected ? "destructive" : "default"}
          className="flex items-center gap-2"
          onClick={isConnected ? endConversation : startConversation}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connecting...
            </>
          ) : isConnected ? (
            <>
              <PhoneOff className="h-4 w-4" />
              End Call
            </>
          ) : (
            <>
              <Phone className="h-4 w-4" />
              {hasApiKey ? 'Start Call' : 'Demo Call'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
