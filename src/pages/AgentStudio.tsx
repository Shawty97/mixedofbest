import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, Phone, Bot, Settings, Play, Square, Loader2 } from 'lucide-react';
import { agentAPI } from '@/services/agentService';
import { audioAPI } from '@/services/audioService';

const AgentStudio: React.FC = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    instructions: '',
    voice_provider: 'elevenlabs',
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Default ElevenLabs voice
    stt_provider: 'openai',
    tts_provider: 'elevenlabs',
    capabilities: [],
    webhook_url: '',
    status: 'active'
  });

  const availableCapabilities = [
    'webhook',
    'calendar',
    'email',
    'phone_calls',
    'knowledge_base'
  ];

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const agentList = await agentAPI.getAll();
      setAgents(agentList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive",
      });
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name.trim()) {
      toast({
        title: "Error",
        description: "Agent name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await agentAPI.create(newAgent);
      toast({
        title: "Success",
        description: "Agent created successfully",
      });
      setNewAgent({
        name: '',
        description: '',
        instructions: '',
        voice_provider: 'elevenlabs',
        voice_id: 'pNInz6obpgDQGcFmaJgB',
        stt_provider: 'openai',
        tts_provider: 'elevenlabs',
        capabilities: [],
        webhook_url: '',
        status: 'active'
      });
      loadAgents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCallAgent = async (agentId: string) => {
    setLoading(true);
    try {
      const result = await agentAPI.call({
        agent_id: agentId,
        metadata: { test_call: true }
      });
      
      toast({
        title: "Call Initiated",
        description: `${result.agent_name} call started`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate agent call",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCapability = (capability: string) => {
    setNewAgent(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        setAudioChunks(prev => [...prev, event.data]);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        try {
          const result = await audioAPI.speechToText(base64Audio);
          toast({
            title: "Transcription",
            description: result.transcription || "No speech detected",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to transcribe audio",
            variant: "destructive",
          });
        }
        
        setAudioChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agent Studio</h1>
        <p className="text-muted-foreground">
          Design, configure, and test AI voice agents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Create New Agent
            </CardTitle>
            <CardDescription>
              Configure a new AI voice agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Support Bot"
                value={newAgent.name}
                onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the agent"
                value={newAgent.description}
                onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="System prompt and behavior instructions"
                value={newAgent.instructions}
                onChange={(e) => setNewAgent(prev => ({ ...prev, instructions: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Voice Provider</Label>
                <Select
                  value={newAgent.voice_provider}
                  onValueChange={(value) => setNewAgent(prev => ({ ...prev, voice_provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="azure">Azure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>STT Provider</Label>
                <Select
                  value={newAgent.stt_provider}
                  onValueChange={(value) => setNewAgent(prev => ({ ...prev, stt_provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI Whisper</SelectItem>
                    <SelectItem value="deepgram">Deepgram</SelectItem>
                    <SelectItem value="azure">Azure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Capabilities</Label>
              <div className="flex flex-wrap gap-2">
                {availableCapabilities.map((capability) => (
                  <div key={capability} className="flex items-center space-x-2">
                    <Switch
                      checked={newAgent.capabilities.includes(capability)}
                      onCheckedChange={() => toggleCapability(capability)}
                    />
                    <Label className="text-sm capitalize">
                      {capability.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {newAgent.capabilities.includes('webhook') && (
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  placeholder="https://your-webhook-url.com"
                  value={newAgent.webhook_url}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, webhook_url: e.target.value }))}
                />
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleCreateAgent}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Agent'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Voice Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Testing
            </CardTitle>
            <CardDescription>
              Test speech-to-text functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
            
            {isRecording && (
              <div className="text-center">
                <div className="animate-pulse text-red-500">
                  🔴 Recording...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Your Agents
          </CardTitle>
          <CardDescription>
            Manage and test your created agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No agents created yet. Create your first agent above.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCallAgent(agent.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-1" />
                          Test Call
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentStudio;