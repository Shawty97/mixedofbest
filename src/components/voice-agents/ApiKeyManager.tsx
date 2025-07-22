
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Key, Save, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ApiKeys {
  openai?: string;
  elevenlabs?: string;
  anthropic?: string;
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState<ApiKeys>({});

  // Load saved keys from localStorage
  useEffect(() => {
    const saved = {
      openai: localStorage.getItem('openai_api_key'),
      elevenlabs: localStorage.getItem('elevenlabs_api_key'),
      anthropic: localStorage.getItem('anthropic_api_key')
    };
    
    const filteredKeys = Object.fromEntries(
      Object.entries(saved).filter(([_, value]) => value !== null)
    ) as ApiKeys;
    
    setApiKeys(filteredKeys);
    setTempKeys(filteredKeys);
  }, []);

  const handleSaveKey = (provider: keyof ApiKeys) => {
    const key = tempKeys[provider];
    if (!key?.trim()) {
      toast({
        title: "Invalid Key",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem(`${provider}_api_key`, key);
    setApiKeys(prev => ({ ...prev, [provider]: key }));
    
    toast({
      title: "API Key Saved",
      description: `${provider.toUpperCase()} API key has been saved locally`,
    });
  };

  const handleDeleteKey = (provider: keyof ApiKeys) => {
    localStorage.removeItem(`${provider}_api_key`);
    setApiKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[provider];
      return newKeys;
    });
    setTempKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[provider];
      return newKeys;
    });

    toast({
      title: "API Key Deleted",
      description: `${provider.toUpperCase()} API key has been removed`,
    });
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const keyConfigs = [
    {
      provider: 'openai' as keyof ApiKeys,
      name: 'OpenAI',
      description: 'For GPT models and text generation',
      placeholder: 'sk-...',
      color: 'bg-green-100 text-green-800'
    },
    {
      provider: 'elevenlabs' as keyof ApiKeys,
      name: 'ElevenLabs',
      description: 'For voice synthesis and conversation',
      placeholder: 'el_...',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      provider: 'anthropic' as keyof ApiKeys,
      name: 'Anthropic',
      description: 'For Claude models and advanced reasoning',
      placeholder: 'sk-ant-...',
      color: 'bg-blue-100 text-blue-800'
    }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Manage your AI service API keys. Keys are stored locally and never sent to our servers.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="manage">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage Keys</TabsTrigger>
            <TabsTrigger value="status">Status Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="space-y-6">
            {keyConfigs.map(({ provider, name, description, placeholder, color }) => (
              <div key={provider} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{name}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  {apiKeys[provider] && (
                    <Badge className={color}>
                      Configured
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type={showKeys[provider] ? "text" : "password"}
                        placeholder={placeholder}
                        value={tempKeys[provider] || ''}
                        onChange={(e) => setTempKeys(prev => ({ 
                          ...prev, 
                          [provider]: e.target.value 
                        }))}
                      />
                      {tempKeys[provider] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => toggleShowKey(provider)}
                        >
                          {showKeys[provider] ? 
                            <EyeOff className="h-3 w-3" /> : 
                            <Eye className="h-3 w-3" />
                          }
                        </Button>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSaveKey(provider)}
                      disabled={!tempKeys[provider]?.trim()}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </Button>
                    {apiKeys[provider] && (
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteKey(provider)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    )}
                  </div>
                  
                  {apiKeys[provider] && (
                    <div className="text-xs text-muted-foreground">
                      Current: {maskKey(apiKeys[provider]!)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {keyConfigs.map(({ provider, name, color }) => (
                <Card key={provider}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{name}</h3>
                      <Badge 
                        className={apiKeys[provider] ? color : 'bg-gray-100 text-gray-600'}
                      >
                        {apiKeys[provider] ? 'Active' : 'Not Set'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {apiKeys[provider] ? 'Ready for use' : 'API key required'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Security Information</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• API keys are stored only in your browser's local storage</li>
                  <li>• Keys are never transmitted to our servers</li>
                  <li>• Clear your browser data to remove all stored keys</li>
                  <li>• Each service validates keys independently</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
