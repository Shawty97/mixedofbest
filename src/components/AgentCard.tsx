
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgentCardProps {
  name: string;
  description: string;
  type: 'chat' | 'voice';
  model?: string;
  tags?: string[];
  onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  name, 
  description, 
  type, 
  model = 'GPT-4',
  tags = [],
  onClick 
}) => {
  return (
    <Card className="card-gradient overflow-hidden transition-all hover:-translate-y-1 duration-300 h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          <Badge variant={type === 'voice' ? 'default' : 'secondary'} className="capitalize">
            {type === 'voice' ? '🔊 Voice' : '💬 Chat'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-secondary/50">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="h-3 w-3 rounded-full bg-ai-blue animate-pulse-glow"></div>
          <span className="text-xs text-muted-foreground">{model}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={onClick} size="sm" className="w-full">
          {type === 'voice' ? 'Talk to Agent' : 'Chat with Agent'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentCard;
