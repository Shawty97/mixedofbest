
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { AIKeyManager } from './AIKeyManager';
import { AITestInterface } from './AITestInterface';

export function WorkflowSettingsPanel() {
  const handleKeysUpdated = (keys: { [provider: string]: string }) => {
    console.log('AI Keys updated:', Object.keys(keys).filter(k => keys[k]).length, 'providers configured');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workflow Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configure AI model access and workflow execution settings.
          </p>
        </CardContent>
      </Card>
      
      <AIKeyManager onKeysUpdated={handleKeysUpdated} />
      
      <AITestInterface />
    </div>
  );
}
