
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AgentBlueprint, AgentImprovementEntry } from "@/types/agent.types";
import { Brain, TrendingUp, BarChart as BarChartIcon, Clock, FileBarChart2, ArrowUp, ArrowDown } from "lucide-react";

interface AgentPerformanceProps {
  agent: AgentBlueprint;
}

export function AgentPerformancePanel({ agent }: AgentPerformanceProps) {
  const hasImprovementData = agent.improvementLog && agent.improvementLog.length > 0;
  const hasFeedbackData = agent.feedbackHistory && agent.feedbackHistory.length > 0;
  
  // Generate some mock performance data if none exists
  const performanceData = agent.performanceMetrics ? [
    {
      name: 'Initial',
      successRate: agent.performanceMetrics.successRate ? agent.performanceMetrics.successRate * 0.8 : 65,
      userSatisfaction: agent.performanceMetrics.userSatisfaction ? agent.performanceMetrics.userSatisfaction * 0.8 : 70,
      completionTime: agent.performanceMetrics.completionTime ? agent.performanceMetrics.completionTime * 1.2 : 3.4,
    },
    {
      name: 'Current',
      successRate: agent.performanceMetrics.successRate || 80,
      userSatisfaction: agent.performanceMetrics.userSatisfaction || 85,
      completionTime: agent.performanceMetrics.completionTime || 2.8,
    }
  ] : [
    { name: 'Initial', successRate: 65, userSatisfaction: 70, completionTime: 3.4 },
    { name: 'Current', successRate: 80, userSatisfaction: 85, completionTime: 2.8 }
  ];
  
  // Mock improvement log if none provided
  const improvementLog = agent.improvementLog || [
    {
      id: 'imp-1',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      changeType: 'prompt',
      description: 'Refined initial prompt to be more specific about context requirements',
      triggeredBy: 'system',
      performanceImpact: 5.2
    },
    {
      id: 'imp-2',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      changeType: 'parameter',
      description: 'Adjusted temperature parameter to improve response consistency',
      triggeredBy: 'self',
      performanceImpact: 3.8
    },
    {
      id: 'imp-3',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      changeType: 'capability',
      description: 'Added capability to handle multilingual inputs',
      triggeredBy: 'user',
      performanceImpact: 7.5
    }
  ] as AgentImprovementEntry[];
  
  // Generate feedback metrics
  const feedbackMetrics = {
    accuracy: agent.feedbackHistory ? 
      agent.feedbackHistory.reduce((acc, fb) => acc + (fb.metrics?.accuracy || 0), 0) / agent.feedbackHistory.length * 100 : 
      78,
    speed: agent.feedbackHistory ? 
      agent.feedbackHistory.reduce((acc, fb) => acc + (fb.metrics?.speed || 0), 0) / agent.feedbackHistory.length * 100 : 
      85,
    relevance: agent.feedbackHistory ? 
      agent.feedbackHistory.reduce((acc, fb) => acc + (fb.metrics?.relevance || 0), 0) / agent.feedbackHistory.length * 100 : 
      82,
    helpfulness: agent.feedbackHistory ? 
      agent.feedbackHistory.reduce((acc, fb) => acc + (fb.metrics?.helpfulness || 0), 0) / agent.feedbackHistory.length * 100 : 
      90,
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-quantum-600" />
          Agent Performance & Improvement
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="metrics">
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">
              <FileBarChart2 className="h-4 w-4 mr-1" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="improvement">
              <TrendingUp className="h-4 w-4 mr-1" />
              Improvement History
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <BarChartIcon className="h-4 w-4 mr-1" />
              Feedback Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate</span>
                  <Badge variant="outline" className="font-mono">
                    {performanceData[1].successRate}%
                  </Badge>
                </div>
                <Progress value={performanceData[1].successRate} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User Satisfaction</span>
                  <Badge variant="outline" className="font-mono">
                    {performanceData[1].userSatisfaction}%
                  </Badge>
                </div>
                <Progress value={performanceData[1].userSatisfaction} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completion Time</span>
                  <Badge variant="outline" className="font-mono">
                    {performanceData[1].completionTime}s
                  </Badge>
                </div>
                <Progress 
                  value={100 - ((performanceData[1].completionTime / 5) * 100)}
                  className="h-2" 
                />
              </div>
            </div>
            
            <div className="bg-muted/40 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  { name: 'Week 1', value: 65 },
                  { name: 'Week 2', value: 68 },
                  { name: 'Week 3', value: 72 },
                  { name: 'Week 4', value: 78 },
                  { name: 'Week 5', value: 85 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[50, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    name="Overall Performance" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="improvement" className="space-y-4">
            {improvementLog.map((improvement) => (
              <div 
                key={improvement.id} 
                className="p-4 border rounded-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {improvement.changeType.charAt(0).toUpperCase() + improvement.changeType.slice(1)}
                  </Badge>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {improvement.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm">{improvement.description}</p>
                
                <div className="mt-2 flex items-center justify-between">
                  <Badge 
                    variant={improvement.triggeredBy === 'self' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {improvement.triggeredBy === 'self' ? 'Self-improved' : 
                      improvement.triggeredBy === 'system' ? 'System-triggered' : 'User-requested'}
                  </Badge>
                  
                  <div className="flex items-center">
                    <span className="text-xs mr-1 font-medium">Impact:</span>
                    <Badge 
                      className={`flex items-center ${
                        improvement.performanceImpact > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {improvement.performanceImpact > 0 ? 
                        <ArrowUp className="h-3 w-3 mr-1" /> : 
                        <ArrowDown className="h-3 w-3 mr-1" />
                      }
                      {Math.abs(improvement.performanceImpact)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="feedback" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Accuracy</span>
                <Progress value={feedbackMetrics.accuracy} className="h-2" />
                <span className="text-xs text-right block">{feedbackMetrics.accuracy}%</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Speed</span>
                <Progress value={feedbackMetrics.speed} className="h-2" />
                <span className="text-xs text-right block">{feedbackMetrics.speed}%</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Relevance</span>
                <Progress value={feedbackMetrics.relevance} className="h-2" />
                <span className="text-xs text-right block">{feedbackMetrics.relevance}%</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Helpfulness</span>
                <Progress value={feedbackMetrics.helpfulness} className="h-2" />
                <span className="text-xs text-right block">{feedbackMetrics.helpfulness}%</span>
              </div>
            </div>
            
            <div className="bg-muted/40 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-medium mb-2">User Ratings Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { rating: '1 Star', count: 2 },
                  { rating: '2 Stars', count: 5 },
                  { rating: '3 Stars', count: 12 },
                  { rating: '4 Stars', count: 35 },
                  { rating: '5 Stars', count: 46 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="User Ratings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
