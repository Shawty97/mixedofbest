import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Code, TestTube, Settings } from 'lucide-react';

const Studio: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Studio</h1>
        <p className="text-muted-foreground">
          Create and manage intelligent AI agents with advanced capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agent Builder
            </CardTitle>
            <CardDescription>
              Create custom AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">New Agent</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Generator
            </CardTitle>
            <CardDescription>
              AI-powered code generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Generate</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Testing Lab
            </CardTitle>
            <CardDescription>
              Test and validate agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Test Agent</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Studio;