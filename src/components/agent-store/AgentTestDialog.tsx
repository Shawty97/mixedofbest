
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Square, Mic, MicOff, MessageSquare, BarChart3, Settings } from "lucide-react";
import { AgentType } from "@/hooks/use-agent-store";
import { toast } from "@/hooks/use-toast";

interface AgentTestDialogProps {
  agent: AgentType;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentTestDialog({ agent, isOpen, onClose }: AgentTestDialogProps) {
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleRunTest = async () => {
    if (!testInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide test input for the agent.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    
    // Simulate agent processing
    setTimeout(() => {
      const mockOutput = generateMockResponse(agent, testInput);
      setTestOutput(mockOutput);
      
      const testResult = {
        id: Date.now(),
        input: testInput,
        output: mockOutput,
        timestamp: new Date(),
        responseTime: Math.random() * 2000 + 500, // 500-2500ms
        success: true
      };
      
      setTestResults(prev => [testResult, ...prev.slice(0, 4)]); // Keep last 5 results
      setIsRunning(false);
      
      toast({
        title: "Test Completed",
        description: "Agent responded successfully.",
      });
    }, 1500);
  };

  const generateMockResponse = (agent: AgentType, input: string): string => {
    const responses = {
      'Marketing Specialist': `Based on your request "${input}", here's a marketing strategy:

1. **Target Audience Analysis**: Focus on digital-native consumers aged 25-45
2. **Content Strategy**: Create engaging visual content for social platforms
3. **Channel Mix**: Prioritize Instagram, LinkedIn, and TikTok for maximum reach
4. **Budget Allocation**: 60% digital ads, 30% content creation, 10% analytics tools
5. **KPIs**: Track engagement rate, conversion rate, and brand awareness metrics

This strategy should deliver 20-30% improvement in brand engagement within 60 days.`,
      
      'Sales Expert': `For your sales inquiry "${input}", here's my recommendation:

🎯 **Opportunity Assessment**: High-value prospect identified
📊 **Qualification Score**: 8.5/10 based on BANT criteria
💡 **Approach Strategy**: Consultative selling with ROI focus
⏰ **Timeline**: 2-3 touchpoints over 14 days recommended
📈 **Expected Outcome**: 75% probability of conversion

Next steps: Schedule discovery call within 48 hours for optimal results.`,

      'Content Creator': `Content suggestion for "${input}":

📝 **Content Type**: Educational blog post with infographic
🎯 **Target Keywords**: [Primary], [Secondary], [Long-tail]
📅 **Publishing Schedule**: Tuesday 10 AM for optimal engagement
🔗 **Distribution**: LinkedIn, Medium, company blog
📊 **Expected Performance**: 500+ views, 50+ engagements, 10+ shares

Content outline and draft ready for review. Estimated completion: 24 hours.`
    };

    return responses[agent.name as keyof typeof responses] || 
           `Thank you for your request "${input}". As a ${agent.name}, I've analyzed your requirements and here's my response:

This is a comprehensive solution tailored to your specific needs. Based on my training and capabilities, I recommend a multi-step approach that addresses your core objectives while maintaining efficiency and quality standards.

Key recommendations:
- Immediate action items with clear timelines
- Strategic considerations for long-term success  
- Resource optimization suggestions
- Performance metrics for tracking progress

Would you like me to elaborate on any specific aspect of this recommendation?`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Speak your test input...",
      });
      
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        setTestInput("This is a sample voice input for testing the agent's capabilities with speech-to-text integration.");
        toast({
          title: "Recording Complete",
          description: "Voice input has been converted to text.",
        });
      }, 3000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-quantum-600" />
            Test Agent: {agent.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <div className="flex gap-2">
                {agent.categories.map((category, index) => (
                  <Badge key={index} variant="outline">{category}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{agent.description}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat Test</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="settings">Test Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              {/* Input Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Input</label>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your test prompt or question for the agent..."
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="min-h-24"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleRecording}
                      className={isRecording ? "text-red-600" : ""}
                    >
                      {isRecording ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                      {isRecording ? "Stop Recording" : "Voice Input"}
                    </Button>
                    <Button
                      onClick={handleRunTest}
                      disabled={isRunning || !testInput.trim()}
                      className="bg-quantum-600 hover:bg-quantum-700"
                    >
                      {isRunning ? (
                        <>
                          <Square className="h-4 w-4 mr-1" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Run Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Output Section */}
              {testOutput && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent Response</label>
                  <Card>
                    <CardContent className="pt-4">
                      <pre className="whitespace-pre-wrap text-sm">{testOutput}</pre>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Previous Test Results */}
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recent Tests</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {testResults.map((result) => (
                      <Card key={result.id} className="text-xs">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">Test #{result.id}</span>
                            <Badge variant={result.success ? "default" : "destructive"}>
                              {result.responseTime.toFixed(0)}ms
                            </Badge>
                          </div>
                          <div className="text-gray-600 truncate">{result.input}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-quantum-600">4.8/5</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-quantum-600">1.2s</div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-quantum-600">94%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-quantum-600">1.2k</div>
                      <div className="text-sm text-gray-600">Total Tests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Test Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Test Environment</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Demo Mode (Safe Testing)</option>
                        <option>Sandbox Environment</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Response Format</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Text Response</option>
                        <option>Structured JSON</option>
                        <option>Rich Media</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-quantum-600 hover:bg-quantum-700">
              Hire This Agent
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
