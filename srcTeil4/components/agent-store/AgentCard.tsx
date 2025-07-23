
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AgentType } from "@/hooks/use-agent-store";
import { Brain, Star, Download, CheckCircle, PlayCircle, MessageSquare, BrainCircuit, Zap, Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: AgentType;
  isSelected?: boolean;
  onSelect?: () => void;
  onHire?: () => void;
  onTest?: () => void;
  onFeedback?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onDownload?: () => void;
  viewMode?: 'grid' | 'list';
}

export function AgentCard({ 
  agent, 
  isSelected, 
  onSelect, 
  onHire, 
  onTest, 
  onFeedback,
  isFavorite,
  onToggleFavorite,
  onDownload,
  viewMode = 'grid'
}: AgentCardProps) {
  // Self-improvement indicator - this would be calculated based on actual agent data
  const hasImprovement = agent.id === 'agent-1' || agent.id === 'agent-3';
  const improvementProgress = hasImprovement ? 65 : undefined;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all", 
        isSelected 
          ? "ring-2 ring-quantum-500 shadow-md" 
          : "hover:shadow-md",
        "relative"
      )}
      onClick={() => onSelect && onSelect()}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-quantum-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Selected
          </Badge>
        </div>
      )}
      
      <div
        className="h-32 bg-cover bg-center"
        style={{
          backgroundImage: agent.coverImage
            ? `url(${agent.coverImage})`
            : "linear-gradient(to right, var(--quantum-300), var(--quantum-500))",
        }}
      >
        <div className="w-full h-full bg-black/30 flex items-center justify-center">
          {!agent.coverImage && (
            <Brain className="h-12 w-12 text-white" />
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <p className="text-sm text-gray-500">by {agent.creator}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={
                agent.price === "Free"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              }
            >
              {agent.price}
            </Badge>
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "text-gray-400")} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {agent.description}
        </p>

        <div className="flex items-center mt-3 gap-2">
          {agent.categories.map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>
        
        {hasImprovement && improvementProgress !== undefined && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1 text-quantum-600">
                <BrainCircuit className="h-3 w-3" />
                <span>Self-improving</span>
              </div>
              <span className="text-gray-500">{improvementProgress}%</span>
            </div>
            <Progress value={improvementProgress} className="h-1" />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{agent.rating}</span>
          <span className="text-xs text-gray-500">({agent.reviews})</span>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTest && onTest();
                  }}
                >
                  <PlayCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Test this agent</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {onFeedback && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFeedback();
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Give feedback</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-quantum-600 hover:bg-quantum-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDownload) {
                      onDownload();
                    } else if (onHire) {
                      onHire();
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-1" /> 
                  {onDownload ? 'Download' : 'Hire'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {onDownload ? 'Download this agent' : 'Add this agent to your workspace'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
}
