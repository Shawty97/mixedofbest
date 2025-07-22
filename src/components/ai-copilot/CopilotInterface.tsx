
import React, { useState, useEffect } from 'react';
import { CommandPalette } from './CommandPalette';
import { SessionHistory } from './SessionHistory';
import { CodeSuggestionPanel } from './CodeSuggestionPanel';
import { DebugAssistant } from './DebugAssistant';
import { PerformanceAdvisor } from './PerformanceAdvisor';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, History, Settings, Bug, Zap, Code } from 'lucide-react';
import { useEnhancedCopilotStore } from './store/enhancedCopilotStore';

interface CopilotInterfaceProps {
  showCommandPalette?: boolean;
  workflowContext?: any;
}

export function CopilotInterface({ showCommandPalette = true, workflowContext }: CopilotInterfaceProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const { 
    currentConversationId, 
    conversations, 
    sessionStats,
    updateWorkflowContext 
  } = useEnhancedCopilotStore();

  // Update workflow context when it changes
  useEffect(() => {
    if (workflowContext) {
      updateWorkflowContext(workflowContext);
    }
  }, [workflowContext, updateWorkflowContext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+K to open main panel
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        setIsPanelOpen(true);
      }
      
      // Cmd+Shift+D for debug assistant
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsPanelOpen(true);
        setActiveTab('debug');
      }

      // Cmd+Shift+P for performance advisor  
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsPanelOpen(true);
        setActiveTab('performance');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentConversation = currentConversationId ? conversations.get(currentConversationId) : undefined;

  return (
    <>
      {/* Main command palette */}
      {showCommandPalette && <CommandPalette />}
      
      {/* Floating action button */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-2">
        <Button 
          className="h-12 w-12 rounded-full p-0 shadow-lg"
          onClick={() => setIsPanelOpen(true)}
        >
          <Sparkles className="h-6 w-6" />
        </Button>
        
        {/* Session stats indicator */}
        {sessionStats.totalCommands > 0 && (
          <div className="bg-white rounded-lg shadow-md p-2 text-xs text-center border">
            <div className="text-neural-600 font-medium">{sessionStats.totalCommands}</div>
            <div className="text-gray-500">Commands</div>
          </div>
        )}
      </div>

      {/* Main copilot panel */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-neural-600" />
              AI Copilot
            </SheetTitle>
            <SheetDescription>
              Intelligente Entwicklungsunterstützung für Ihre AI-Workflows
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 h-[calc(100vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="chat" className="text-xs">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="text-xs">
                  <Code className="h-4 w-4 mr-1" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="debug" className="text-xs">
                  <Bug className="h-4 w-4 mr-1" />
                  Debug
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-xs">
                  <Zap className="h-4 w-4 mr-1" />
                  Perf
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs">
                  <History className="h-4 w-4 mr-1" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-4 h-[calc(100%-60px)]">
                <TabsContent value="chat" className="h-full">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      {currentConversation ? (
                        <div className="space-y-4">
                          {currentConversation.messages.map((message, index) => (
                            <div 
                              key={index}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === 'user' 
                                  ? 'bg-neural-100 text-neural-900' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                {message.metadata && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    {message.metadata.tokensUsed && `${message.metadata.tokensUsed} tokens`}
                                    {message.metadata.processingTime && ` • ${message.metadata.processingTime}ms`}
                                    {message.metadata.model && ` • ${message.metadata.model}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Starten Sie eine Unterhaltung mit dem AI Copilot</p>
                            <p className="text-sm mt-2">Drücken Sie Cmd+K für die Eingabe</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="suggestions" className="h-full">
                  <CodeSuggestionPanel />
                </TabsContent>
                
                <TabsContent value="debug" className="h-full">
                  <DebugAssistant />
                </TabsContent>
                
                <TabsContent value="performance" className="h-full">
                  <PerformanceAdvisor />
                </TabsContent>
                
                <TabsContent value="history" className="h-full">
                  <SessionHistory />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

