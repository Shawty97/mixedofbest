
import { useAgentBuilder } from '@/hooks/use-agent-builder';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';

export function AgentList() {
  const { agents, selectedAgent, selectAgent, createAgent } = useAgentBuilder();

  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Agents</h2>
          <Button size="sm" onClick={createAgent}>
            <Plus className="mr-2" />
            New Agent
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => selectAgent(agent.id)}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
              selectedAgent?.id === agent.id
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent'
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={agent.profile.avatar} alt={agent.profile.name} />
              <AvatarFallback>
                <Bot />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{agent.profile.name}</p>
              <p className="text-xs text-muted-foreground truncate">{agent.profile.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
