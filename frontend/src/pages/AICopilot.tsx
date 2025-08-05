import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Code, Zap } from 'lucide-react';

const AICopilot: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Copilot</h1>
        <p className="text-muted-foreground">
          AI-powered development assistant for intelligent automation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Assistant
            </CardTitle>
            <CardDescription>
              Get help with development tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Generator
            </CardTitle>
            <CardDescription>
              Generate code snippets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Generate</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Automated development tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Actions</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AICopilot;