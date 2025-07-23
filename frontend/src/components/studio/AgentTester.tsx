import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

interface AgentTesterProps {
  agent: any;
}

export function AgentTester({ agent }: AgentTesterProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callLogs, setCallLogs] = useState<string[]>([]);

  const startCall = () => {
    setIsConnected(true);
    setCallLogs(prev => [...prev, `Call started with ${agent.name}`]);
  };

  const endCall = () => {
    setIsConnected(false);
    setCallLogs(prev => [...prev, 'Call ended']);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setCallLogs(prev => [...prev, isMuted ? 'Unmuted' : 'Muted']);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Your Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex space-x-2">
            {!isConnected ? (
              <Button onClick={startCall} className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Start Test Call
              </Button>
            ) : (
              <>
                <Button onClick={endCall} variant="destructive" className="flex items-center gap-2">
                  <PhoneOff className="w-4 h-4" />
                  End Call
                </Button>
                <Button onClick={toggleMute} variant="outline" className="flex items-center gap-2">
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
              </>
            )}
          </div>

          {isConnected && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Connected to {agent.name}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {callLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Call Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {callLogs.map((log, index) => (
                <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {new Date().toLocaleTimeString()}: {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}