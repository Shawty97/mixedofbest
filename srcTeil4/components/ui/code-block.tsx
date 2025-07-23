
import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from './button';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  onChange?: (code: string) => void;
}

export function CodeBlock({ code, language = "javascript", className, onChange }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [editable, setEditable] = useState(false);
  const [value, setValue] = useState(code);

  useEffect(() => {
    setValue(code);
  }, [code]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      setValue(
        value.substring(0, start) + '  ' + value.substring(end)
      );

      // Set cursor position after the inserted tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-950">
        <div className="text-xs text-gray-400">
          {language}
        </div>
        <div className="flex items-center space-x-2">
          {onChange && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => setEditable(!editable)}
            >
              {editable ? 'View' : 'Edit'}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      
      {editable && onChange ? (
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 border-0 outline-none resize-none"
          spellCheck="false"
        />
      ) : (
        <SyntaxHighlighter 
          language={language} 
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            backgroundColor: '#1e1e1e',
            maxHeight: className ? undefined : '400px',
            height: className && className.includes('h-') ? '100%' : undefined
          }}
        >
          {value}
        </SyntaxHighlighter>
      )}
    </div>
  );
}
