import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useConversation } from '@11labs/react';
import { VoiceAgent } from '@/types/voice-agent.types';
import { Mic, MicOff, Brain, PieChart, Sparkles, Gauge, Headphones, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceAgentAdvancedProps {
  agent: VoiceAgent;
  apiKey?: string;
  onEmotionDetected?: (emotion: string, confidence: number) => void;
  onLatencyMeasured?: (latency: number) => void;
}

// Emotions we can detect
const EMOTIONS = [
  'neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'confused', 'interested'
];

// Conversation message type
interface ConversationMessage {
  role: string;
  content: string;
}

// ElevenLabs message type
interface ElevenLabsMessage {
  message: string;
  source: string;
}

export function VoiceAgentAdvanced({ agent, apiKey, onEmotionDetected, onLatencyMeasured }: VoiceAgentAdvancedProps) {
  const [isListening, setIsListening] = useState(false);
  const [emotionData, setEmotionData] = useState<{ emotion: string; confidence: number } | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [predictedResponse, setPredictedResponse] = useState<string | null>(null);
  const [emotionEnabled, setEmotionEnabled] = useState(true);
  const [predictiveEnabled, setPredictiveEnabled] = useState(true);
  const [latencyOptimizationLevel, setLatencyOptimizationLevel] = useState(75);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  const { toast } = useToast();

  // Use ElevenLabs conversation hook
  const conversation = useConversation({
    // This is a client tool that can be invoked by the agent
    clientTools: {
      showEmotion: (parameters: {emotion: string; confidence: number}) => {
        if (emotionEnabled) {
          setEmotionData(parameters);
          onEmotionDetected?.(parameters.emotion, parameters.confidence);
        }
        return "Emotion registered";
      },
      
      measureLatency: (parameters: {milliseconds: number}) => {
        setLatency(parameters.milliseconds);
        onLatencyMeasured?.(parameters.milliseconds);
        return "Latency measured";
      },
      
      predictNextResponse: (parameters: {text: string}) => {
        if (predictiveEnabled) {
          setPredictedResponse(parameters.text);
        }
        return "Prediction registered";
      }
    },
    
    // Optional overrides for the conversation
    overrides: {
      agent: {
        prompt: {
          prompt: agent.systemPrompt || 
            `You are a helpful assistant named ${agent.name}. ${agent.customInstructions || ''}`,
        },
        language: "en",
      },
      tts: {
        voiceId: agent.voiceId
      },
    },
    
    // Event handlers
    onConnect: () => {
      toast({
        title: "Voice agent connected",
        description: `${agent.name} is ready to assist you.`,
      });
    },
    onDisconnect: () => {
      setIsListening(false);
      toast({
        title: "Voice agent disconnected",
        description: `Connection with ${agent.name} has ended.`,
      });
    },
    onMessage: (msg: ElevenLabsMessage) => {
      // Add message to conversation history
      if (msg.message) {
        setConversationHistory(prev => [...prev, {
          role: msg.source,
          content: msg.message
        }]);
      }
    },
    onError: (message: string) => {
      toast({
        title: "Error",
        description: message || "An unknown error occurred",
        variant: "destructive",
      });
      setIsListening(false);
    }
  });

  // Start/stop listening
  const toggleListening = async () => {
    try {
      if (!isListening) {
        // Request microphone permissions
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Start the conversation
        if (apiKey) {
          await conversation.startSession({
            agentId: agent.id,
          });
          setIsListening(true);
        } else {
          toast({
            title: "API Key Required",
            description: "Please provide an ElevenLabs API key to use voice features.",
            variant: "destructive",
          });
        }
      } else {
        // End the conversation
        await conversation.endSession();
        setIsListening(false);
      }
    } catch (error) {
      console.error("Error toggling voice agent:", error);
      toast({
        title: "Error",
        description: "Could not access microphone or connect to voice service.",
        variant: "destructive",
      });
    }
  };

  // Apply latency optimization
  useEffect(() => {
    // Simulate latency optimization based on slider value
    if (latencyOptimizationLevel > 0) {
      const optimizedLatency = Math.max(85, 300 - (latencyOptimizationLevel * 2.5));
      setLatency(Math.round(optimizedLatency));
    }
  }, [latencyOptimizationLevel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        conversation.endSession().catch(console.error);
      }
    };
  }, [isListening, conversation]);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>{agent.name}</span>
              {agent.isActive && <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>}
            </CardTitle>
            <CardDescription>{agent.description}</CardDescription>
          </div>
          <Button 
            variant={isListening ? "destructive" : "default"}
            size="icon"
            onClick={toggleListening}
            className="h-12 w-12 rounded-full"
          >
            {isListening ? <MicOff /> : <Mic />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Voice and Conversation Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">Voice: {agent.voiceName || "Default"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm">
              {conversation.isSpeaking ? "Speaking" : isListening ? "Listening" : "Idle"}
            </div>
            {isListening && (
              <div className="flex gap-1">
                <div className="h-2 w-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
                <div className="h-3 w-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
                <div className="h-4 w-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></div>
                <div className="h-3 w-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: "900ms" }}></div>
                <div className="h-2 w-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1200ms" }}></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Advanced Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Emotion Detection */}
          <div className="border rounded-md p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Emotion Detection</h3>
              </div>
              <Switch 
                checked={emotionEnabled} 
                onCheckedChange={setEmotionEnabled} 
              />
            </div>
            {emotionEnabled && emotionData && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-quantum-50 text-quantum-700">
                  {emotionData.emotion} ({Math.round(emotionData.confidence * 100)}%)
                </Badge>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-quantum-600" 
                    style={{ width: `${emotionData.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            {emotionEnabled && !emotionData && (
              <div className="text-sm text-muted-foreground">Waiting for emotion detection...</div>
            )}
          </div>
          
          {/* Latency Measurement */}
          <div className="border rounded-md p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Ultra-Low Latency</h3>
              </div>
              <Badge 
                variant={latency && latency < 100 ? "default" : "outline"}
                className={latency && latency < 100 ? "bg-green-100 text-green-800" : ""}
              >
                {latency ? `${latency}ms` : "Measuring..."}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Optimization Level</span>
                <span>{latencyOptimizationLevel}%</span>
              </div>
              <Slider 
                value={[latencyOptimizationLevel]}
                onValueChange={(values) => setLatencyOptimizationLevel(values[0])}
                max={100}
                step={5}
              />
            </div>
          </div>
        </div>
        
        {/* Predictive Intelligence */}
        <div className="border rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Predictive Intelligence</h3>
            </div>
            <Switch 
              checked={predictiveEnabled} 
              onCheckedChange={setPredictiveEnabled} 
            />
          </div>
          {predictiveEnabled && (
            <div className="space-y-2">
              {predictedResponse ? (
                <div>
                  <div className="text-xs text-muted-foreground">Predicted response:</div>
                  <div className="p-2 bg-muted rounded-md text-sm">{predictedResponse}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Waiting for predictions...</div>
              )}
            </div>
          )}
        </div>
        
        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="space-y-3 border rounded-md p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Conversation</h3>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {conversationHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-muted ml-8' 
                      : 'bg-quantum-50 text-quantum-900 dark:bg-quantum-900 dark:text-quantum-100 mr-8'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">
                    {message.role === 'user' ? 'You' : agent.name}
                  </div>
                  <div className="text-sm">{message.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Model: {agent.modelName || agent.modelId}
        </div>
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs">Capabilities: {agent.capabilities?.length || 0}</span>
        </div>
      </CardFooter>
    </Card>
  );
}