import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Phone, Settings, PlayCircle } from 'lucide-react';

const VoiceAgents: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Voice Agents</h1>
        <p className="text-muted-foreground">
          Voice-enabled AI assistants with natural conversation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Builder
            </CardTitle>
            <CardDescription>
              Create voice-enabled agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Integration
            </CardTitle>
            <CardDescription>
              Connect to phone systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Setup</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Voice Testing
            </CardTitle>
            <CardDescription>
              Test voice interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Test</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAgents;