
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AIServiceFactory, AIProvider } from '@/services/ai/AIServiceFactory';
import { toast } from '@/hooks/use-toast';

interface AIKeyManagerProps {
  onKeysUpdated?: (keys: { [provider: string]: string }) => void;
}

export function AIKeyManager({ onKeysUpdated }: AIKeyManagerProps) {
  const [keys, setKeys] = useState<{ [provider: string]: string }>({
    openai: '',
    anthropic: ''
  });
  
  const [showKeys, setShowKeys] = useState<{ [provider: string]: boolean }>({
    openai: false,
    anthropic: false
  });
  
  const [testingKeys, setTestingKeys] = useState<{ [provider: string]: boolean }>({});
  const [keyStatus, setKeyStatus] = useState<{ [provider: string]: 'untested' | 'valid' | 'invalid' }>({
    openai: 'untested',
    anthropic: 'untested'
  });

  // Load keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('ai-api-keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setKeys(parsed);
        // Test saved keys
        testAllKeys(parsed);
      } catch (error) {
        console.error('Failed to load saved API keys:', error);
      }
    }
  }, []);

  const handleKeyChange = (provider: AIProvider, value: string) => {
    const newKeys = { ...keys, [provider]: value };
    setKeys(newKeys);
    
    // Reset status when key changes
    setKeyStatus(prev => ({ ...prev, [provider]: 'untested' }));
    
    // Save to localStorage
    localStorage.setItem('ai-api-keys', JSON.stringify(newKeys));
    
    // Notify parent
    if (onKeysUpdated) {
      onKeysUpdated(newKeys);
    }
  };

  const toggleShowKey = (provider: AIProvider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const testKey = async (provider: AIProvider) => {
    const apiKey = keys[provider];
    if (!apiKey || apiKey.trim().length === 0) {
      toast({
        title: "API Key Required",
        description: `Please enter your ${provider.toUpperCase()} API key first`,
        variant: "destructive"
      });
      return;
    }

    setTestingKeys(prev => ({ ...prev, [provider]: true }));

    try {
      const service = AIServiceFactory.createService({ provider, apiKey });
      const isValid = await service.testConnection();
      
      setKeyStatus(prev => ({ ...prev, [provider]: isValid ? 'valid' : 'invalid' }));
      
      toast({
        title: isValid ? "Connection Successful" : "Connection Failed",
        description: isValid 
          ? `${provider.toUpperCase()} API key is working correctly`
          : `${provider.toUpperCase()} API key is invalid or connection failed`,
        variant: isValid ? "default" : "destructive"
      });

    } catch (error) {
      setKeyStatus(prev => ({ ...prev, [provider]: 'invalid' }));
      toast({
        title: "Connection Error",
        description: `Failed to test ${provider.toUpperCase()} connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setTestingKeys(prev => ({ ...prev, [provider]: false }));
    }
  };

  const testAllKeys = async (keysToTest = keys) => {
    const validKeys = Object.entries(keysToTest).filter(([_, key]) => key && key.trim().length > 0);
    
    if (validKeys.length === 0) return;

    const configs = validKeys.map(([provider, apiKey]) => ({
      provider: provider as AIProvider,
      apiKey
    }));

    try {
      const results = await AIServiceFactory.testAllConnections(configs);
      
      const newStatus = { ...keyStatus };
      results.forEach(result => {
        newStatus[result.provider] = result.connected ? 'valid' : 'invalid';
      });
      setKeyStatus(newStatus);

    } catch (error) {
      console.error('Failed to test API keys:', error);
    }
  };

  const getStatusBadge = (provider: AIProvider) => {
    const status = keyStatus[provider];
    const isLoading = testingKeys[provider];

    if (isLoading) {
      return <Badge variant="outline"><Loader2 className="h-3 w-3 animate-spin mr-1" />Testing</Badge>;
    }

    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Invalid</Badge>;
      default:
        return <Badge variant="outline">Untested</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          AI API Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(['openai', 'anthropic'] as AIProvider[]).map(provider => (
          <div key={provider} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={provider} className="capitalize">
                {provider} API Key
              </Label>
              {getStatusBadge(provider)}
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={provider}
                  type={showKeys[provider] ? 'text' : 'password'}
                  value={keys[provider]}
                  onChange={(e) => handleKeyChange(provider, e.target.value)}
                  placeholder={`Enter your ${provider.toUpperCase()} API key`}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey(provider)}
                >
                  {showKeys[provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => testKey(provider)}
                disabled={testingKeys[provider] || !keys[provider]}
              >
                {testingKeys[provider] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Test'
                )}
              </Button>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button 
            onClick={() => testAllKeys()} 
            variant="outline" 
            className="w-full"
            disabled={Object.values(testingKeys).some(Boolean)}
          >
            Test All Connections
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2">
            API keys are stored locally in your browser and are required for AI model execution.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
