
import { useState } from 'react';
import { useAgentBuilder } from '@/hooks/use-agent-builder';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TestMessage {
  sender: 'user' | 'agent';
  text: string;
}

export default function AgentTestTab() {
  const { selectedAgent, testAgent } = useAgentBuilder();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!selectedAgent) return null;

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent) return;

    const userMessage: TestMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const agentResponse = await testAgent(input);
    const agentMessage: TestMessage = { sender: 'agent', text: agentResponse.response };
    
    setMessages((prev) => [...prev, agentMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <ScrollArea className="flex-1 p-4 pr-6">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'agent' && (
                <Avatar>
                  <AvatarImage src={selectedAgent.profile.avatar} />
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg px-4 py-2 max-w-[75%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{msg.text}</p>
              </div>
              {msg.sender === 'user' && (
                 <Avatar>
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
                 <Avatar>
                  <AvatarImage src={selectedAgent.profile.avatar} />
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                 <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                    <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-foreground rounded-full animate-bounce"></span>
                 </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}
