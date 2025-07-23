
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIServiceFactory, AIProvider } from '@/services/ai/AIServiceFactory';
import { Loader2, TestTube } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AITestInterface() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [prompt, setPrompt] = useState('Schreibe einen kurzen Text über KI.');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cost, setCost] = useState<number | null>(null);

  const testAI = async () => {
    if (!apiKey || !prompt) {
      toast({
        title: "Fehler",
        description: "API Key und Prompt sind erforderlich",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResponse('');
    setCost(null);

    try {
      const service = AIServiceFactory.createService({ provider, apiKey });
      
      const result = await service.generateCompletion(prompt, {
        model,
        temperature: 0.7,
        maxTokens: 200
      });

      setResponse(result.content);
      
      // Calculate cost
      const inputTokens = (result.usage as any).inputTokens || (result.usage as any).promptTokens || 0;
      const outputTokens = (result.usage as any).outputTokens || (result.usage as any).completionTokens || 0;
      
      // Simple cost calculation
      const estimatedCost = provider === 'openai' 
        ? (inputTokens * 0.00015 + outputTokens * 0.0006) / 1000
        : (inputTokens * 0.00025 + outputTokens * 0.00125) / 1000;
      
      setCost(estimatedCost);

      toast({
        title: "Erfolg!",
        description: `AI-Response erhalten. Tokens: ${result.usage.totalTokens}`,
      });

    } catch (error) {
      console.error('AI Test Error:', error);
      toast({
        title: "AI-Test Fehler",
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          AI Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Provider</label>
            <Select value={provider} onValueChange={(value: AIProvider) => setProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {provider === 'openai' ? (
                  <>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                    <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">API Key</label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`${provider.toUpperCase()} API Key eingeben`}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Test Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Test-Prompt eingeben..."
            rows={3}
          />
        </div>

        <Button onClick={testAI} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI wird getestet...
            </>
          ) : (
            'AI Integration testen'
          )}
        </Button>

        {response && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-2">AI Response:</h4>
            <p className="text-sm">{response}</p>
            {cost !== null && (
              <p className="text-xs text-gray-500 mt-2">
                Geschätzte Kosten: ${cost.toFixed(6)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
