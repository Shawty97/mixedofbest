
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Code, Layout, FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCopilotStore } from './store/copilotStore';
import { formatDistanceToNow } from 'date-fns';

export function SessionHistory() {
  const { sessionHistory, currentHistoryIndex } = useCopilotStore();

  const getCommandIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <Code className="h-4 w-4" />;
      case 'ui':
        return <Layout className="h-4 w-4" />;
      case 'doc':
        return <FileText className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getCommandTypeBadge = (type: string) => {
    switch (type) {
      case 'code':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Code</Badge>;
      case 'ui':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">UI</Badge>;
      case 'doc':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Doc</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">General</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      default:
        return null;
    }
  };

  if (sessionHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>No commands have been executed yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Your command history will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <CardDescription>
          {sessionHistory.length} commands in this session
        </CardDescription>
      </CardHeader>
      <ScrollArea className="h-[400px]">
        <CardContent>
          <div className="space-y-4">
            {sessionHistory.map((command, index) => (
              <div 
                key={command.id} 
                className={`p-3 border rounded-md ${
                  index === currentHistoryIndex 
                    ? 'border-neural-500 bg-neural-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCommandIcon(command.type)}
                    <span className="font-medium truncate max-w-[200px]">
                      {command.command}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCommandTypeBadge(command.type)}
                    {getStatusBadge(command.status)}
                  </div>
                </div>
                
                {command.response && (
                  <div className="mt-2 text-sm bg-gray-50 p-2 rounded border border-gray-100 max-h-[150px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{command.response}</pre>
                  </div>
                )}
                
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>ID: {command.id.substring(0, 8)}...</span>
                  <span>{formatDistanceToNow(command.timestamp)} ago</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
