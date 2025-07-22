
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { aiProviders } from './config/aiProviders';
import { Badge } from '@/components/ui/badge';

interface ModelComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModels?: { providerId: string, modelId: string }[];
}

export function ModelComparisonDialog({ 
  open, 
  onOpenChange,
  selectedModels = [] 
}: ModelComparisonDialogProps) {
  // If no models are selected, show all models
  const modelsToCompare = selectedModels.length > 0 
    ? selectedModels.map(selected => {
        const provider = aiProviders.find(p => p.id === selected.providerId);
        const model = provider?.models.find(m => m.id === selected.modelId);
        return { provider, model };
      }).filter(item => item.provider && item.model) as { provider: typeof aiProviders[0], model: typeof aiProviders[0]['models'][0] }[]
    : aiProviders.flatMap(provider => 
        provider.models.map(model => ({ provider, model }))
      );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>AI Model Comparison</DialogTitle>
          <DialogDescription>
            Compare capabilities, performance, and pricing across different AI models
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px]">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Model</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead className="text-right">Max Tokens</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead className="text-right">Cost per 1K tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelsToCompare.map(({ provider, model }) => (
                  <TableRow key={`${provider.id}-${model.id}`}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.map(capability => (
                          <Badge key={capability} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{model.maxTokens?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{model.latencyMs} ms</TableCell>
                    <TableCell className="text-right">${model.costPer1KTokens}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Performance Guide</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p>
                  <strong>Latency</strong>: Measured in milliseconds, lower values indicate faster response times.
                </p>
                <p>
                  <strong>Max Tokens</strong>: The maximum context length the model can process, including both input and output.
                </p>
                <p>
                  <strong>Cost</strong>: Pricing is per 1,000 tokens, with tokens roughly corresponding to 4 characters or 0.75 words.
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Capability Guide</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs mr-2">Text Generation</Badge>
                  <span className="text-gray-500 dark:text-gray-400">Standard text response generation</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs mr-2">Code</Badge>
                  <span className="text-gray-500 dark:text-gray-400">Programming language generation</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs mr-2">Reasoning</Badge>
                  <span className="text-gray-500 dark:text-gray-400">Complex problem solving</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs mr-2">Vision</Badge>
                  <span className="text-gray-500 dark:text-gray-400">Image understanding</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
