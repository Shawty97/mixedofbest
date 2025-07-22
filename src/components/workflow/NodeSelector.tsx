
import { Brain, Database, Layout, CircuitBoard, BarChart3, UserRound, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ModelComparisonDialog } from './ModelComparisonDialog';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const nodeTypes = [
  {
    type: 'voiceToAgent',
    label: 'Voice to Agent',
    icon: Mic,
    color: 'bg-purple-100 text-purple-600 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
    capabilities: ['Voice Input', 'Agent Creation', 'Auto-Config'],
    data: {
      label: 'Voice to Agent',
      description: 'Create agents by describing them with your voice',
    },
  },
  {
    type: 'input',
    label: 'Input',
    icon: Database,
    color: 'bg-green-100 text-green-600 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    capabilities: ['Text Input', 'Image Upload'],
    data: {
      label: 'Input',
      content: 'Enter your prompt here...',
    },
  },
  {
    type: 'aiModel',
    label: 'AI Model',
    icon: Brain,
    color: 'bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    capabilities: ['Provider Selection', 'Version Control', 'Fine-tuning'],
    data: {
      provider: 'openai',
      model: 'gpt-4o',
      description: 'Processes inputs using the selected AI model',
    },
  },
  {
    type: 'processing',
    label: 'Processing',
    icon: CircuitBoard,
    color: 'bg-amber-100 text-amber-600 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    capabilities: ['Transform', 'Filter', 'Aggregate'],
    data: {
      processingType: 'transform',
      description: 'Processes and transforms data between nodes',
    },
  },
  {
    type: 'output',
    label: 'Output',
    icon: Layout,
    color: 'bg-purple-100 text-purple-600 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
    capabilities: ['Format', 'Display', 'Export'],
    data: {
      description: 'Formats and delivers the final output',
    },
  },
];

export function NodeSelector() {
  const [showModelComparison, setShowModelComparison] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/node', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Node Types</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setShowModelComparison(true)}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Compare AI Models</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2">
          {nodeTypes.map((node) => (
            <div
              key={node.type}
              className={`flex flex-col gap-2 p-3 border rounded cursor-move ${node.color}`}
              draggable
              onDragStart={(event) => onDragStart(event, node.type, node.data)}
            >
              <div className="flex items-center gap-2">
                <node.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{node.label}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {node.capabilities.map((capability, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-[10px] py-0 px-1 bg-white/50 dark:bg-gray-900/50"
                  >
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <ModelComparisonDialog 
        open={showModelComparison} 
        onOpenChange={setShowModelComparison} 
      />
    </>
  );
}
