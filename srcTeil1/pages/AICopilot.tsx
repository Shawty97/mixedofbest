
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { CopilotInterface } from '@/components/ai-copilot/CopilotInterface';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Code, Layout, FileText, Terminal } from 'lucide-react';

const AICopilot = () => {
  return (
    <PageLayout>
      <div className="bg-gradient-to-r from-quantum-50 to-neural-50 dark:from-gray-900 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
            <Brain className="h-8 w-8 text-neural-600" />
            AI Co-pilot Interface
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
            Command-based AI assistant with smart suggestions and session management
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="demo">
          <TabsList className="grid grid-cols-4 w-full md:w-[600px] mb-8">
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Demo
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="ui" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              UI
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Docs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-3">Command Interpreter</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Use natural language commands to interact with the AI co-pilot. The system automatically recognizes your intent and suggests actions.
                </p>
                <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  Try commands like:<br />
                  "Generate a login form component"<br />
                  "Create documentation for API endpoints"<br />
                  "Explain how state management works"
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-3">Smart Suggestions</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  As you type, the co-pilot offers context-aware suggestions to help complete your thoughts or guide you to better commands.
                </p>
                <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  Features:<br />
                  • Fuzzy matching<br />
                  • Intent recognition<br />
                  • Command chaining<br />
                  • Context-aware completions
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-3">Session Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Every interaction is tracked in a persistent session. View history, undo/redo actions, and continue where you left off.
                </p>
                <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  Session features:<br />
                  • Command history<br />
                  • Undo/redo support<br />
                  • Context carryover<br />
                  • Savable/loadable sessions
                </div>
              </Card>
            </div>
            
            <div className="mt-10">
              <div className="border-t pt-8 text-center text-gray-600 dark:text-gray-400">
                <p className="mb-4 text-lg">Try the AI co-pilot by pressing <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Cmd</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">K</kbd> or using the button in the bottom right</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="code">
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-4">Code Generation Examples</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Command: "Create a React hook for managing form state"</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <pre className="text-sm overflow-x-auto">
{`import { useState } from 'react';

export const useFormState = (initialState = {}) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Your validation logic would go here
    
    onSubmit(values);
    setIsSubmitting(false);
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
};`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Command: "Generate a utility function to format currency"</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <pre className="text-sm overflow-x-auto">
{`/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @param {string} locale - The locale (default: en-US)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return \`\${amount} \${currency}\`;
  }
};

// Examples:
// formatCurrency(1234.56) => "$1,234.56"
// formatCurrency(1234.56, 'EUR', 'de-DE') => "1.234,56 €"`}
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="ui">
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-4">UI Generation Examples</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Command: "Create a user profile card"</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-neural-100 flex items-center justify-center text-neural-600 font-bold text-xl">
                          JD
                        </div>
                        <div>
                          <h4 className="text-lg font-medium">John Doe</h4>
                          <p className="text-gray-500 dark:text-gray-400">Product Designer</p>
                          <div className="flex gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              UX
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              UI
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="font-medium">128</div>
                            <div className="text-xs text-gray-500">Projects</div>
                          </div>
                          <div>
                            <div className="font-medium">1.4k</div>
                            <div className="text-xs text-gray-500">Followers</div>
                          </div>
                          <div>
                            <div className="font-medium">4.7</div>
                            <div className="text-xs text-gray-500">Rating</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Command: "Design a notification bell with badge"</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <div className="flex justify-center p-4 bg-white dark:bg-gray-900 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </button>
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                          8
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="docs">
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-4">Documentation Examples</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Command: "Explain the AI Co-pilot architecture"</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <div className="prose dark:prose-invert max-w-none">
                      <h2>AI Co-pilot Architecture</h2>
                      <p>The AI Co-pilot is built on three core components that work together to provide an intelligent assistant experience:</p>
                      
                      <h3>1. Command Interpreter</h3>
                      <p>The front-end component that processes natural language input and translates it into structured commands that the system can understand. Features include:</p>
                      <ul>
                        <li>Intent recognition to classify commands by type (code, UI, documentation)</li>
                        <li>Entity extraction to identify key parameters</li>
                        <li>Fuzzy matching for command suggestions</li>
                        <li>Context awareness to maintain state between interactions</li>
                      </ul>
                      
                      <h3>2. Orchestration Service</h3>
                      <p>The middleware layer that routes commands to appropriate services and manages the execution flow:</p>
                      <ul>
                        <li>Command routing based on intent and parameters</li>
                        <li>Parallel processing of complex requests</li>
                        <li>Response aggregation from multiple services</li>
                        <li>Error handling and graceful degradation</li>
                      </ul>
                      
                      <h3>3. Session Management</h3>
                      <p>The state management system that maintains context across interactions:</p>
                      <ul>
                        <li>History tracking with undo/redo capability</li>
                        <li>Context carryover between commands</li>
                        <li>Persistent sessions with save/load functionality</li>
                        <li>Versioning to track changes over time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* The co-pilot interface */}
      <CopilotInterface />
    </PageLayout>
  );
}

export default AICopilot;
