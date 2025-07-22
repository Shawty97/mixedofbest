
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Key, ExternalLink, CheckCircle } from 'lucide-react';
import { useEnhancedCopilotStore } from './store/enhancedCopilotStore';

export function ApiKeySetup() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [savedKeys, setSavedKeys] = useState({
    openai: !!localStorage.getItem('openai_api_key'),
    anthropic: !!localStorage.getItem('anthropic_api_key')
  });

  const { setApiKey } = useEnhancedCopilotStore();

  const handleSaveOpenaiKey = () => {
    if (openaiKey.trim()) {
      setApiKey('openai', openaiKey.trim());
      setSavedKeys(prev => ({ ...prev, openai: true }));
      setOpenaiKey('');
    }
  };

  const handleSaveAnthropicKey = () => {
    if (anthropicKey.trim()) {
      setApiKey('anthropic', anthropicKey.trim());
      setSavedKeys(prev => ({ ...prev, anthropic: true }));
      setAnthropicKey('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="h-12 w-12 mx-auto mb-4 text-neural-600" />
        <h2 className="text-2xl font-bold mb-2">Configure AI Services</h2>
        <p className="text-gray-600">
          Add your API keys to enable AI-powered features
        </p>
      </div>

      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          Your API keys are stored securely in your browser's local storage and are never sent to our servers.
          They are only used to communicate directly with OpenAI and Anthropic APIs.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* OpenAI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              OpenAI API
              {savedKeys.openai && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  >
                    {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSaveOpenaiKey} disabled={!openaiKey.trim()}>
                  Save
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">Enables access to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>GPT-4 and GPT-3.5 Turbo models</li>
                <li>Advanced code generation and analysis</li>
                <li>Natural language processing</li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get OpenAI API Key
            </Button>
          </CardContent>
        </Card>

        {/* Anthropic Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              Anthropic API
              {savedKeys.anthropic && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    type={showAnthropicKey ? 'text' : 'password'}
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  >
                    {showAnthropicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSaveAnthropicKey} disabled={!anthropicKey.trim()}>
                  Save
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">Enables access to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Claude 3 Sonnet and Haiku models</li>
                <li>Long-form content generation</li>
                <li>Complex reasoning and analysis</li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://console.anthropic.com/settings/keys', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Anthropic API Key
            </Button>
          </CardContent>
        </Card>
      </div>

      {(savedKeys.openai || savedKeys.anthropic) && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Great! Your API keys are configured. You can now use the AI co-pilot with full functionality.
            Press Cmd+K (or Ctrl+K) to open the command palette and start chatting with AI.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
