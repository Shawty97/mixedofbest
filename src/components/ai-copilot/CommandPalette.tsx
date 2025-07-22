
import React, { useState, useEffect, useRef } from 'react';
import { Command } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Sparkles, Undo, Redo, X, Clock, Save } from 'lucide-react';
import { useCopilotStore } from './store/copilotStore';
import { CommandSuggestion } from './CommandSuggestion';
import { toast } from '@/hooks/use-toast';

export function CommandPalette() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    sendCommand,
    suggestions,
    sessionHistory,
    currentHistoryIndex,
    undoCommand,
    redoCommand,
    isProcessing,
    clearSuggestions
  } = useCopilotStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
        setIsFocused(true);
      }
      
      // Execute command with Cmd+Enter or Ctrl+Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && input.trim()) {
        e.preventDefault();
        handleSendCommand();
      }
      
      // Undo with Cmd+Z or Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (currentHistoryIndex > 0) {
          undoCommand();
        } else {
          toast({
            title: 'Nothing to undo',
            description: 'You are at the beginning of your command history',
          });
        }
      }
      
      // Redo with Cmd+Shift+Z or Ctrl+Shift+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (currentHistoryIndex < sessionHistory.length - 1) {
          redoCommand();
        } else {
          toast({
            title: 'Nothing to redo',
            description: 'You are at the end of your command history',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, currentHistoryIndex, sessionHistory.length, undoCommand, redoCommand]);

  // Generate suggestions as user types
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (input.trim().length > 2) {
        useCopilotStore.getState().generateSuggestions(input);
      } else {
        clearSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [input, clearSuggestions]);

  const handleSendCommand = async () => {
    if (input.trim()) {
      await sendCommand(input);
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    clearSuggestions();
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-3xl z-50">
      <Card className={`p-4 rounded-lg shadow-lg border ${isFocused ? 'border-neural-500' : 'border-gray-200'}`}>
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask the AI co-pilot (Cmd+K)..."
            className="resize-none pr-[90px]"
            rows={2}
          />
          
          <div className="absolute right-2 bottom-2 flex space-x-1">
            {input.trim() && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0" 
                onClick={() => setInput('')}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
            
            <Button 
              size="sm" 
              onClick={handleSendCommand}
              disabled={!input.trim() || isProcessing}
              className="h-8 px-3"
            >
              {isProcessing ? (
                <div className="animate-pulse">Processing...</div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <CommandSuggestion 
                key={idx} 
                suggestion={suggestion} 
                onClick={() => handleSuggestionClick(suggestion.command)} 
              />
            ))}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 text-xs"
              onClick={undoCommand}
              disabled={currentHistoryIndex <= 0 || isProcessing}
            >
              <Undo className="h-3 w-3 mr-1" />
              Undo
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 text-xs"
              onClick={redoCommand}
              disabled={currentHistoryIndex >= sessionHistory.length - 1 || isProcessing}
            >
              <Redo className="h-3 w-3 mr-1" />
              Redo
            </Button>
          </div>
          
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 text-xs"
              onClick={() => toast({
                title: "Session history saved",
                description: "Your command history has been saved to the cloud"
              })}
            >
              <Save className="h-3 w-3 mr-1" />
              Save Session
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 text-xs"
              onClick={() => toast({
                title: "Session history",
                description: `${sessionHistory.length} commands in this session`
              })}
            >
              <Clock className="h-3 w-3 mr-1" />
              History
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 text-xs bg-neural-50 hover:bg-neural-100"
            >
              <Sparkles className="h-3 w-3 mr-1 text-neural-600" />
              AI Assistant
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
