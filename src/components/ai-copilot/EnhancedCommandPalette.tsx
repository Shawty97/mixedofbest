
import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Sparkles, 
  History, 
  Settings, 
  Brain, 
  Code, 
  Layout, 
  Workflow,
  MessageSquare,
  Zap,
  Clock,
  DollarSign,
  Cpu,
  X,
  Plus,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { useEnhancedCopilotStore } from './store/enhancedCopilotStore';
import { toast } from '@/hooks/use-toast';

export function EnhancedCommandPalette() {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    currentConversationId,
    conversations,
    suggestions,
    isProcessing,
    aiConfig,
    sessionStats,
    sendCommand,
    createNewConversation,
    switchConversation,
    deleteConversation,
    generateSuggestions,
    clearSuggestions,
    updateAIConfig,
    setApiKey,
    loadConversations,
    exportConversation,
    clearAllData,
    getSessionStats
  } = useEnhancedCopilotStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      
      // Send command with Cmd+Enter or Ctrl+Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && input.trim() && isOpen) {
        e.preventDefault();
        handleSendCommand();
      }
      
      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, isOpen]);

  // Generate suggestions as user types
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (input.trim().length > 2) {
        generateSuggestions(input);
      } else {
        clearSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [input, generateSuggestions, clearSuggestions]);

  const handleSendCommand = async () => {
    if (input.trim()) {
      await sendCommand(input);
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInput(suggestion.command);
    clearSuggestions();
  };

  const handleNewConversation = () => {
    createNewConversation();
    setActiveTab('chat');
  };

  const currentConversation = conversations.get(currentConversationId);
  const conversationsList = Array.from(conversations.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Brain className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-neural-600" />
            AI Co-pilot
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
              {/* Current Conversation */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 overflow-y-auto">
                {currentConversation ? (
                  <div className="space-y-4">
                    {currentConversation.messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-neural-600 text-white' 
                            : 'bg-white dark:bg-gray-800 border'
                        }`}>
                          <div className="text-sm">{message.content}</div>
                          {message.metadata && (
                            <div className="text-xs opacity-70 mt-2 flex gap-2">
                              {message.metadata.tokensUsed && (
                                <span>Tokens: {message.metadata.tokensUsed}</span>
                              )}
                              {message.metadata.cost && (
                                <span>Cost: ${message.metadata.cost.toFixed(4)}</span>
                              )}
                              {message.metadata.processingTime && (
                                <span>Time: {message.metadata.processingTime}ms</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a new conversation with the AI co-pilot</p>
                  </div>
                )}
              </div>

              {/* Command Input */}
              <div className="space-y-3">
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Badge variant="secondary" className="mr-1 h-4 px-1">
                          {suggestion.type}
                        </Badge>
                        {suggestion.command.slice(0, 40)}...
                      </Button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the AI co-pilot anything... (Cmd+K to focus, Cmd+Enter to send)"
                    className="resize-none pr-12"
                    rows={2}
                  />
                  <Button 
                    size="sm" 
                    className="absolute right-2 bottom-2 h-8"
                    onClick={handleSendCommand}
                    disabled={!input.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="animate-spin">⏳</div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Model Selection */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Model: {aiConfig.model}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={handleNewConversation}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Chat
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 mt-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {conversationsList.length > 0 ? (
                  conversationsList.map((conversation) => (
                    <Card 
                      key={conversation.id}
                      className={`cursor-pointer transition-colors ${
                        conversation.id === currentConversationId ? 'ring-2 ring-neural-500' : ''
                      }`}
                      onClick={() => {
                        switchConversation(conversation.id);
                        setActiveTab('chat');
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{conversation.title}</h4>
                            <p className="text-xs text-gray-500">
                              {conversation.messages.length} messages • {conversation.updatedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportConversation(conversation.id);
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conversation.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversation history yet</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAllData}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 mt-4 space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">AI Model</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded"
                    value={aiConfig.model}
                    onChange={(e) => updateAIConfig({ model: e.target.value as any })}
                  >
                    <option value="gpt-4">GPT-4 (Most Capable)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku (Fast)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">OpenAI API Key</label>
                  <input
                    type="password"
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="sk-..."
                    onChange={(e) => setApiKey('openai', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Anthropic API Key</label>
                  <input
                    type="password"
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="sk-ant-..."
                    onChange={(e) => setApiKey('anthropic', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Temperature: {aiConfig.temperature}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiConfig.temperature}
                    onChange={(e) => updateAIConfig({ temperature: parseFloat(e.target.value) })}
                    className="w-full mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Lower = more focused, Higher = more creative
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Max Tokens</label>
                  <input
                    type="number"
                    min="100"
                    max="8000"
                    value={aiConfig.maxTokens}
                    onChange={(e) => updateAIConfig({ maxTokens: parseInt(e.target.value) })}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="flex-1 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-neural-600" />
                    <div className="text-2xl font-bold">{sessionStats.totalCommands}</div>
                    <div className="text-xs text-gray-500">Total Commands</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{sessionStats.totalTokens.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Tokens Used</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">${sessionStats.totalCost.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">Total Cost</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{conversations.size}</div>
                    <div className="text-xs text-gray-500">Conversations</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Session Info</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Started: {sessionStats.sessionStartTime.toLocaleString()}</div>
                    <div>Current Model: {aiConfig.model}</div>
                    <div>Active Conversation: {currentConversationId || 'None'}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
