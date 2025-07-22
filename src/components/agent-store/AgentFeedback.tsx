
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { AgentFeedback as AgentFeedbackType } from "@/types/agent.types";
import { StarIcon, ThumbsUp, BrainCircuit } from "lucide-react";
import { Label } from "@/components/ui/label";

interface AgentFeedbackProps {
  agentId: string;
  taskId?: string;
  onFeedbackSubmit: (feedback: Omit<AgentFeedbackType, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function AgentFeedback({ agentId, taskId, onFeedbackSubmit, onClose }: AgentFeedbackProps) {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [metrics, setMetrics] = useState({
    accuracy: 50,
    speed: 50,
    relevance: 50,
    helpfulness: 50
  });

  const handleMetricChange = (metric: string, value: number[]) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: value[0]
    }));
  };

  const handleSubmit = () => {
    const feedback: Omit<AgentFeedbackType, 'id' | 'createdAt'> = {
      userId: 'current-user', // Would be replaced with actual user ID
      rating,
      comment,
      taskId,
      metrics: {
        accuracy: metrics.accuracy / 100,
        speed: metrics.speed / 100, 
        relevance: metrics.relevance / 100,
        helpfulness: metrics.helpfulness / 100
      }
    };
    
    onFeedbackSubmit(feedback);
    
    toast({
      title: "Feedback Submitted",
      description: "Your feedback will help improve this agent's performance.",
    });
    
    onClose();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-quantum-600" />
          Agent Performance Feedback
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Overall Rating</Label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant={star <= rating ? "default" : "outline"}
                size="sm"
                onClick={() => setRating(star)}
                className={star <= rating ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500" : ""}
              >
                <StarIcon className="h-4 w-4" />
              </Button>
            ))}
            <span className="ml-2 text-sm font-medium">{rating}/5</span>
          </div>
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Accuracy</Label>
            <Slider 
              value={[metrics.accuracy]} 
              min={0} 
              max={100} 
              step={1} 
              onValueChange={(value) => handleMetricChange('accuracy', value)} 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Speed</Label>
            <Slider 
              value={[metrics.speed]} 
              min={0} 
              max={100} 
              step={1} 
              onValueChange={(value) => handleMetricChange('speed', value)} 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Relevance</Label>
            <Slider 
              value={[metrics.relevance]} 
              min={0} 
              max={100} 
              step={1} 
              onValueChange={(value) => handleMetricChange('relevance', value)} 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Off-topic</span>
              <span>On-point</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Helpfulness</Label>
            <Slider 
              value={[metrics.helpfulness]} 
              min={0} 
              max={100} 
              step={1} 
              onValueChange={(value) => handleMetricChange('helpfulness', value)} 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Unhelpful</span>
              <span>Very helpful</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <Label htmlFor="feedback-comment">Additional Comments</Label>
          <Textarea
            id="feedback-comment"
            placeholder="What went well? What could be improved?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-20 resize-none"
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="flex items-center gap-2"
        >
          <ThumbsUp className="h-4 w-4" />
          Submit Feedback
        </Button>
      </CardFooter>
    </Card>
  );
}
