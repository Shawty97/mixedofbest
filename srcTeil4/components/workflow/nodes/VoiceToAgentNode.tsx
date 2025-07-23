
import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mic, MicOff, Play, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NodeDataProps } from '../types/workflow.types';
import { toast } from '@/hooks/use-toast';

function VoiceToAgentNodeComponent({ data = {}, isConnectable = true }: { data?: NodeDataProps; isConnectable?: boolean }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentSpec, setAgentSpec] = useState<null | {
    role: string;
    capabilities: string[];
    type: string;
  }>(null);
  
  const startRecording = () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      toast({
        title: "Microphone Access Error",
        description: "Your browser does not support microphone access or you're in a demo mode.",
        variant: "destructive"
      });
      
      // In demo mode, simulate recording anyway
      simulateRecording();
      return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setIsRecording(true);
        toast({
          title: "Recording",
          description: "Speak to create your agent"
        });
        
        // Simulate recording - in a real app, use Web Speech API or similar
        setTimeout(() => {
          setIsRecording(false);
          setTranscript("Create me a customer service agent that can handle product inquiries and order status checks.");
          
          // In a production app, we'd send this to an LLM to generate the agent spec
          setTimeout(() => {
            setAgentSpec({
              role: "Customer Service Assistant",
              capabilities: ["Product Information", "Order Tracking", "Issue Resolution"],
              type: "Support Agent"
            });
          }, 1000);
        }, 3000);
      })
      .catch(error => {
        console.error("Microphone access error:", error);
        toast({
          title: "Microphone Access Denied",
          description: "Using demo mode instead",
        });
        
        // If permission denied, still show a demo
        simulateRecording();
      });
  };
  
  const simulateRecording = () => {
    setIsRecording(true);
    toast({
      title: "Demo Mode",
      description: "Simulating recording experience"
    });
    
    // Simulate recording timeout
    setTimeout(() => {
      setIsRecording(false);
      setTranscript("Create me a sales agent that can handle customer inquiries and process orders.");
      
      // Simulate agent spec generation
      setTimeout(() => {
        setAgentSpec({
          role: "Sales Representative",
          capabilities: ["Product Knowledge", "Order Processing", "Customer Service"],
          type: "Sales Agent"
        });
        
        toast({
          title: "Demo Complete",
          description: "Agent created in demo mode"
        });
      }, 1000);
    }, 2000);
  };
  
  const generateAgent = () => {
    if (!transcript) return;
    
    toast({
      title: "Generating Agent",
      description: "Processing your request to create a new agent..."
    });
    
    // Simulate agent generation
    setTimeout(() => {
      setAgentSpec({
        role: "Advanced Customer Service Agent",
        capabilities: ["Product Information", "Order Tracking", "Issue Resolution", "Technical Support", "Returns Processing"],
        type: "Support Agent"
      });
      
      toast({
        title: "Agent Created",
        description: "Your agent has been successfully created and is ready to use"
      });
    }, 2000);
  };
  
  return (
    <div className="p-4 border rounded-md border-purple-500 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-800 w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <UserRound className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <div className="font-medium text-purple-700 dark:text-purple-300">{data?.label || 'Voice to Agent'}</div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 min-h-[80px]">
          {transcript ? (
            <p className="text-sm">{transcript}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isRecording ? "Listening..." : "Click record and describe the agent you want to create..."}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button 
            size="sm" 
            variant={isRecording ? "destructive" : "outline"}
            className="flex items-center gap-1"
            onClick={() => isRecording ? setIsRecording(false) : startRecording()}
          >
            {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            {isRecording ? "Stop" : "Record"}
          </Button>
          
          <Button 
            size="sm" 
            variant="default"
            className="flex items-center gap-1"
            disabled={!transcript}
            onClick={generateAgent}
          >
            <Play className="h-3 w-3" />
            Generate
          </Button>
        </div>
        
        {agentSpec && (
          <div className="mt-3 space-y-2 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium">{agentSpec.role}</div>
            <div className="flex flex-wrap gap-1">
              {agentSpec.capabilities.map((capability, i) => (
                <Badge key={i} variant="outline" className="text-xs">{capability}</Badge>
              ))}
            </div>
            <div className="text-xs text-gray-500">{agentSpec.type}</div>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-600 border-2 border-white dark:border-gray-800"
      />
    </div>
  );
}

export const VoiceToAgentNode = memo(VoiceToAgentNodeComponent);
