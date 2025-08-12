import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, Phone, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  audioUrl?: string;
}

interface VoiceChatInterfaceProps {
  agentId?: string;
  agentName?: string;
  voiceProfile?: string;
}

const VoiceChatInterface: React.FC<VoiceChatInterfaceProps> = ({
  agentId = 'default',
  agentName = 'AI Assistant',
  voiceProfile = 'professional_female'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedVoiceProfile, setSelectedVoiceProfile] = useState(voiceProfile);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const voiceProfiles = [
    { value: 'professional_female', label: 'Professional Female' },
    { value: 'professional_male', label: 'Professional Male' },
    { value: 'friendly_female', label: 'Friendly Female' },
    { value: 'friendly_male', label: 'Friendly Male' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'technical_expert', label: 'Technical Expert' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert speech to text
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      formData.append('language', 'en-US');

      const sttResponse = await fetch('http://localhost:8000/api/voice/stt', {
        method: 'POST',
        body: formData
      });

      if (!sttResponse.ok) {
        throw new Error('Speech-to-text failed');
      }

      const sttResult = await sttResponse.json();
      
      if (sttResult.success && sttResult.text.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          text: sttResult.text,
          sender: 'user',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        await processAgentResponse(sttResult.text);
      } else {
        toast.error('Could not understand speech. Please try again.');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio input');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAgentResponse = async (userInput: string) => {
    try {
      // Generate AI response (mock for now - replace with actual AI service)
      const aiResponse = await generateAIResponse(userInput);
      
      const agentMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);

      // Convert response to speech if audio is enabled
      if (audioEnabled) {
        await convertToSpeech(aiResponse);
      }
    } catch (error) {
      console.error('Error generating agent response:', error);
      toast.error('Failed to generate response');
    }
  };

  const generateAIResponse = async (input: string): Promise<string> => {
    // Mock AI response - replace with actual AI service integration
    const responses = [
      `I understand you said: "${input}". How can I help you further?`,
      `Thank you for your message. Let me assist you with that.`,
      `I'm here to help. Could you provide more details about what you need?`,
      `That's an interesting question. Let me think about the best way to help you.`,
      `I appreciate you reaching out. What specific assistance do you need today?`
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const convertToSpeech = async (text: string) => {
    try {
      setIsPlaying(true);
      
      const ttsResponse = await fetch('http://localhost:8000/api/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voice_profile: selectedVoiceProfile
        })
      });

      if (!ttsResponse.ok) {
        throw new Error('Text-to-speech failed');
      }

      const ttsResult = await ttsResponse.json();
      
      if (ttsResult.success && ttsResult.audio_base64) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(ttsResult.audio_base64), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
          await audioRef.current.play();
        }
      } else {
        console.warn('TTS failed, continuing in text-only mode');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error converting to speech:', error);
      setIsPlaying(false);
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    
    await processAgentResponse(currentInput);
  };

  const toggleConnection = () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      toast.success(`Connected to ${agentName}`);
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        text: `Hello! I'm ${agentName}. How can I assist you today?`,
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else {
      toast.info('Disconnected from agent');
      setMessages([]);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Voice Chat with {agentName}
            </CardTitle>
            <CardDescription>
              Voice-enabled conversation with AI agent
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button
              variant={isConnected ? 'destructive' : 'default'}
              size="sm"
              onClick={toggleConnection}
            >
              {isConnected ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <Select value={selectedVoiceProfile} onValueChange={setSelectedVoiceProfile}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voiceProfiles.map((profile) => (
                <SelectItem key={profile.value} value={profile.value}>
                  {profile.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {audioEnabled ? 'Audio On' : 'Audio Off'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg bg-muted/20">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {isConnected ? 'Start a conversation...' : 'Connect to begin chatting'}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className="bg-background border p-3 rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              disabled={!isConnected || isProcessing}
            />
            <Button
              onClick={sendTextMessage}
              disabled={!isConnected || !inputText.trim() || isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              variant={isRecording ? 'destructive' : 'default'}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected || isProcessing}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
            
            {isPlaying && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                Playing...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <audio ref={audioRef}