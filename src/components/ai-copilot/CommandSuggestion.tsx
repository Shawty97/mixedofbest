
import React from 'react';
import { Sparkles, Code, Layout, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SuggestionType {
  command: string;
  type: 'code' | 'ui' | 'doc' | 'general';
  confidence: number;
}

interface CommandSuggestionProps {
  suggestion: SuggestionType;
  onClick: () => void;
}

export function CommandSuggestion({ suggestion, onClick }: CommandSuggestionProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'code':
        return <Code className="h-3 w-3 mr-1" />;
      case 'ui':
        return <Layout className="h-3 w-3 mr-1" />;
      case 'doc':
        return <FileText className="h-3 w-3 mr-1" />;
      case 'general':
      default:
        return <Sparkles className="h-3 w-3 mr-1" />;
    }
  };

  const getColor = () => {
    switch (suggestion.type) {
      case 'code':
        return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200';
      case 'ui':
        return 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200';
      case 'doc':
        return 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200';
      case 'general':
      default:
        return 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`h-6 px-2 text-xs ${getColor()}`}
      onClick={onClick}
    >
      {getIcon()}
      {suggestion.command.length > 30 ? 
        `${suggestion.command.substring(0, 30)}...` : 
        suggestion.command}
    </Button>
  );
}
