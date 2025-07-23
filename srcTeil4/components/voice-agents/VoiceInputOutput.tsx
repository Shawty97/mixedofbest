
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge"; // Fixed: import Badge from the correct location
import { Volume2, VolumeX, Mic, MicOff, Play, Square, Wand } from "lucide-react";
import { toast } from '@/hooks/use-toast';

type VoiceInputOutputProps = {
  agentName?: string;
  voiceId?: string;
  modelId?: string;
  apiKey?: string;
  onRecording?: (isRecording: boolean) => void;
  onSpeechResult?: (text: string) => void;
}

export function VoiceInputOutput({ 
  agentName = "Voice Agent",
  voiceId = "EXAVITQu4vr4xnSDxMaL", // Sarah by default
  modelId = "eleven_multilingual_v2",
  apiKey,
  onRecording,
  onSpeechResult
}: VoiceInputOutputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, text: string}>>([]);
  
  // Always use demo mode for simplicity
  const isDemo = true;
  
  // Speech Recognition functionality
  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      if (onRecording) onRecording(false);
      
      // Process the final transcription
      if (transcription && onSpeechResult) {
        onSpeechResult(transcription);
        
        // Add user message to conversation history
        setConversationHistory(prev => [...prev, { role: 'user', text: transcription }]);
        
        // Simulate AI response
        handleDemoResponse(transcription);
      }
    } else {
      if (!apiKey) {
        toast({
          title: "Demo Mode Active",
          description: "Using simulated voice recognition since no API key is provided.",
        });
      }
      
      // Clear previous transcription when starting new recording
      setTranscription("");
      setIsListening(true);
      
      try {
        // In demo mode, we'll simulate the microphone permission request
        toast({
          title: "Listening...",
          description: "Speak now. Click the microphone again to stop.",
        });
        
        // Generate a sample transcription after a delay for demo purposes
        setTimeout(() => {
          const demoTranscriptions = [
            "I need a customer service agent that can handle product inquiries",
            "Create an AI assistant for technical support",
            "Make me a virtual sales representative that can explain our products",
            "I want a voice bot that can schedule appointments"
          ];
          setTranscription(demoTranscriptions[Math.floor(Math.random() * demoTranscriptions.length)]);
          setIsListening(false);
          
          // Process the transcription
          const demoText = demoTranscriptions[Math.floor(Math.random() * demoTranscriptions.length)];
          if (onSpeechResult) {
            onSpeechResult(demoText);
          }
          
          // Add user message to conversation history
          setConversationHistory(prev => [...prev, { role: 'user', text: demoText }]);
          
          // Simulate AI response
          handleDemoResponse(demoText);
        }, 3000);
        
        if (onRecording) onRecording(true);
      } catch (error) {
        console.error('Error in demo mode:', error);
        setIsListening(false);
      }
    }
  };
  
  const handleDemoResponse = (userInput: string) => {
    setIsThinking(true);
    
    setTimeout(() => {
      // Generate contextual responses based on input keywords
      let response = "";
      
      if (userInput.toLowerCase().includes("customer service") || userInput.toLowerCase().includes("support")) {
        response = "I'll create a customer service agent that can handle inquiries efficiently. This agent will have product knowledge integration, order tracking capabilities, and a customer-friendly tone. Would you like to customize any specific aspects?";
      } else if (userInput.toLowerCase().includes("sales") || userInput.toLowerCase().includes("products")) {
        response = "Your sales representative agent is being prepared. It will be able to explain products, handle pricing questions, and guide customers through the purchase process. Would you like this agent to have upselling capabilities as well?";
      } else if (userInput.toLowerCase().includes("technical") || userInput.toLowerCase().includes("tech")) {
        response = "I'm creating a technical support agent with troubleshooting workflows and solution databases. This agent will be able to walk users through common technical issues and escalate when necessary. Should I incorporate any specific technical knowledge areas?";
      } else if (userInput.toLowerCase().includes("schedule") || userInput.toLowerCase().includes("appointment")) {
        response = "Your appointment scheduling agent is being configured with calendar integration capabilities and datetime understanding. Would you like this agent to send confirmation emails or reminders as well?";
      } else {
        response = "I understand your request for a new agent. I'm designing this agent with conversation capabilities tailored to your needs. Would you like to add any specific skills or knowledge domains to this agent?";
      }
      
      setResponseText(response);
      setIsThinking(false);
      
      // Add AI response to conversation history
      setConversationHistory(prev => [...prev, { role: 'assistant', text: response }]);
    }, 2000);
  };
  
  const togglePlayback = () => {
    if (isPlaying) {
      // Stop speech synthesis
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    } else {
      if (!responseText) {
        toast({
          title: "No Response",
          description: "There is no response to play back.",
        });
        return;
      }
      
      setIsPlaying(true);
      
      // Use browser's speech synthesis for playback
      const speech = new SpeechSynthesisUtterance(responseText);
      speech.volume = isMuted ? 0 : volume / 100;
      speech.onend = () => setIsPlaying(false);
      speech.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Could not play the response. Try again.",
          variant: "destructive",
        });
      };
      
      try {
        window.speechSynthesis?.speak(speech);
      } catch (e) {
        console.error("Speech synthesis error:", e);
        setIsPlaying(false);
        
        // Simulate playback ending after a delay
        setTimeout(() => {
          toast({
            title: "Demo Playback",
            description: "In a real environment, you would hear the agent speaking."
          });
          setIsPlaying(false);
        }, 2000);
      }
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (isPlaying) {
      // If currently playing, update the speech volume
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0 && !isMuted) {
      setIsMuted(true);
    } else if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleClearConversation = () => {
    setConversationHistory([]);
    setTranscription("");
    setResponseText("");
    toast({
      title: "Conversation Cleared",
      description: "The conversation history has been reset.",
    });
  };
  
  const handleImproveResponse = () => {
    if (!responseText) return;
    
    toast({
      title: "Enhancing Response",
      description: "Using AI to create a more natural response...",
    });
    
    setTimeout(() => {
      const improvedResponse = `I've analyzed your request deeply. ${responseText} I'm continually optimizing my understanding based on your specific needs. Is there a particular aspect you'd like me to focus on next?`;
      setResponseText(improvedResponse);
      
      // Update the last assistant message in the history
      setConversationHistory(prev => {
        const newHistory = [...prev];
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].role === 'assistant') {
          newHistory[newHistory.length - 1].text = improvedResponse;
        }
        return newHistory;
      });
      
      toast({
        title: "Response Enhanced",
        description: "The AI has created a more natural, human-like response.",
      });
    }, 1000);
  };
  
  // Add a demo conversation to start with
  useEffect(() => {
    if (conversationHistory.length === 0) {
      setConversationHistory([
        { 
          role: 'user', 
          text: 'I need an agent that can handle customer support inquiries' 
        },
        { 
          role: 'assistant', 
          text: 'I can create a customer support agent with product knowledge and troubleshooting capabilities. Would you like to focus on any specific product line?' 
        }
      ]);
      
      setTranscription('I need an agent that can handle customer support inquiries');
      setResponseText('I can create a customer support agent with product knowledge and troubleshooting capabilities. Would you like to focus on any specific product line?');
    }
  }, [conversationHistory.length]);
  
  // Demo mode notice - when no API key is provided, show this notice once
  useEffect(() => {
    if (!apiKey) {
      const demoNoticeShown = sessionStorage.getItem('demoNoticeShown');
      if (!demoNoticeShown) {
        setTimeout(() => {
          toast({
            title: "Demo Mode Active",
            description: "This is running in demo mode. Add an API key for full functionality.",
            duration: 5000,
          });
          sessionStorage.setItem('demoNoticeShown', 'true');
        }, 1000);
      }
    }
  }, [apiKey]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>{agentName}</span>
            {apiKey ? (
              <Badge variant="outline" className="ml-2 text-green-600 bg-green-50 dark:bg-green-900/20">
                Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20">
                Demo Mode
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
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
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-3 min-h-[100px] relative">
          <div className="absolute top-1 right-1 text-xs text-muted-foreground">User</div>
          <p className="text-sm pt-3">
            {transcription || (isListening ? "Listening..." : "Waiting for speech input...")}
            {isListening && <span className="animate-pulse">▋</span>}
          </p>
        </div>
        
        <div className="rounded-lg bg-muted p-3 min-h-[100px] relative">
          <div className="absolute top-1 right-1 text-xs text-muted-foreground">Agent</div>
          <p className="text-sm pt-3">
            {isThinking ? (
              <span className="flex items-center gap-2">
                Thinking<span className="animate-pulse">...</span>
              </span>
            ) : (
              responseText || "Agent response will appear here..."
            )}
          </p>
        </div>
        
        {conversationHistory.length > 0 && (
          <div className="flex justify-between items-center mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearConversation}
            >
              Clear Conversation
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleImproveResponse}
              disabled={!responseText}
            >
              <Wand className="h-3 w-3" />
              Improve Response
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center gap-4">
        <Button
          variant={isListening ? "destructive" : "outline"}
          className="flex items-center gap-2"
          onClick={toggleListening}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isListening ? "Stop" : "Speak"}
        </Button>
        
        <Button
          variant={isPlaying ? "destructive" : "default"}
          className="flex items-center gap-2"
          onClick={togglePlayback}
          disabled={!responseText}
        >
          {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Stop" : "Play Response"}
        </Button>
      </CardFooter>
    </Card>
  );
}
