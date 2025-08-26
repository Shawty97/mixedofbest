import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, 
  Play, Pause, Settings, User, Bot, Clock, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  duration?: number;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  voice?: string;
  language?: string;
}

interface VoiceChatInterfaceProps {
  agent: Agent;
  onCallEnd?: () => void;
}

export function VoiceChatInterface({ agent, onCallEnd }: VoiceChatInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await apiService.getAgents();
      setAgents(data);
      if (data.length > 0) {
        setCurrentAgent(data[0].name);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
      // Use demo agents if API fails
      const demoAgents = [
        { id: '1', name: 'Customer Support Agent', type: 'support' },
        { id: '2', name: 'Sales Assistant', type: 'sales' },
        { id: '3', name: 'Technical Support', type: 'technical' }
      ];
      setAgents(demoAgents);
      setCurrentAgent(demoAgents[0].name);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [currentAudio]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsCallActive(true);
      setCallDuration(0);
      
      // Start call duration timer
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'agent',
        content: `Hello! I'm ${agent.name}. How can I help you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Simulate text-to-speech
      await speakText(welcomeMessage.content);
      
      toast({
        title: 'Call Connected',
        description: `Connected to ${agent.name}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        variant: 'destructive'
      });
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsRecording(false);
    setIsPlaying(false);
    setIsProcessing(false);
    setRecordingTime(0);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    toast({
      title: 'Call Ended',
      description: `Call duration: ${formatTime(callDuration)}`
    });
    
    onCallEnd?.();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudioMessage(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: 'Recording Started',
        description: 'Speak now, your message is being recorded'
      });
    } catch (error) {
      toast({
        title: 'Recording Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const processAudioMessage = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert audio to base64 for API
      const audioBase64 = await blobToBase64(audioBlob);
      
      // Send to speech-to-text API
      const transcription = await apiService.speechToText(audioBase64);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'user',
        content: transcription.text || 'Audio message',
        timestamp: new Date(),
        audioUrl,
        duration: recordingTime
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Generate AI response
      await generateAIResponse(transcription.text || 'Hello');
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Fallback to demo processing
      const transcribedText = generateMockTranscription();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'user',
        content: transcribedText,
        timestamp: new Date(),
        audioUrl,
        duration: recordingTime
      };
      
      setMessages(prev => [...prev, userMessage]);
      await generateAIResponse(transcribedText);
      
      toast({
        title: 'Using Demo Mode',
        description: 'Speech recognition unavailable, using simulated response'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:audio/wav;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    
    const audio = new HTMLAudioElement(audioUrl);
    setCurrentAudio(audio);
    setIsPlaying(true);
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
    
    audio.play();
  };

  const speakText = async (text: string) => {
    setIsPlaying(true);
    
    // Use Web Speech API if available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : 0.8;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      // Try to use a specific voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || voice.name.includes('Microsoft')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      // Fallback: just simulate playback duration
      setTimeout(() => {
        setIsPlaying(false);
      }, text.length * 100);
    }
  };

  const generateMockTranscription = (): string => {
    const mockTranscriptions = [
      "Hello, I need help with my account",
      "Can you tell me about your services?",
      "I'm having trouble with my order",
      "What are your business hours?",
      "I'd like to speak to a manager",
      "Can you help me reset my password?",
      "I want to cancel my subscription",
      "How much does this cost?"
    ];
    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  };

  const generateAIResponse = async (userInput: string) => {
    try {
      // Send message to AI agent
      const response = await apiService.sendMessage({
        message: userInput,
        agent_id: agent.id,
        conversation_id: `voice_${Date.now()}`
      });
      
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        type: 'agent',
        content: response.message || 'I understand. How can I help you further?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Convert response to speech
      await convertToSpeech(response.message || 'I understand. How can I help you further?');
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to demo responses
      const agentResponse = generateAgentResponse(userInput);
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        type: 'agent',
        content: agentResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      await speakText(agentResponse);
    }
  };

  const convertToSpeech = async (text: string) => {
    try {
      const audioData = await apiService.textToSpeech(text);
      const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();
      
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      
    } catch (error) {
      console.error('Error converting to speech:', error);
      await speakText(text);
    }
  };

  const generateAgentResponse = (userMessage: string): string => {
    const responses = {
      account: "I'd be happy to help you with your account. Let me pull up your information.",
      services: "We offer a comprehensive AI agent platform with voice capabilities, workflow automation, and analytics.",
      order: "I can help you track your order. Can you provide me with your order number?",
      hours: "Our support team is available 24/7, and our AI agents are always ready to assist you.",
      manager: "I'm an AI agent, but I can escalate your request to a human manager if needed.",
      password: "I can guide you through the password reset process. You'll receive an email with instructions.",
      cancel: "I understand you'd like to cancel. Let me help you with that process.",
      cost: "Our pricing varies based on usage. Would you like me to explain our different plans?"
    };
    
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return "Thank you for your message. I'm here to help with any questions you might have.";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCallActive && (
              <Badge variant="default" className="bg-green-500">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                {formatTime(callDuration)}
              </Badge>
            )}
            <Badge variant={isCallActive ? 'default' : 'secondary'}>
              {isCallActive ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {message.type === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  {message.audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 px-2"
                      onClick={() => playAudio(message.audioUrl!)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {formatTime(message.duration || 0)}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
          {!isCallActive ? (
            <Button onClick={startCall} size="lg" className="bg-green-500 hover:bg-green-600">
              <Phone className="mr-2 h-4 w-4" />
              Start Call
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={isRecording ? 'destructive' : 'default'}
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? 'animate-pulse' : ''}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isRecording ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop ({formatTime(recordingTime)})
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Hold to Talk
                  </>
                )}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={endCall}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        {isCallActive && (
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              {isProcessing ? 'Processing your message...' : isRecording ? 'Recording... Speak now' : 'Click "Hold to Talk" to speak'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}