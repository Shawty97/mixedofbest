
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from '@/components/ui/code-block';
import { ProcessingConfigs } from './nodes/processing/ProcessingConfigs';
import { CustomNode } from './types/workflow.types';
import { AdvancedProcessingConfig } from './nodes/processing/AdvancedProcessingConfig';

export interface NodePreviewProps {
  node: CustomNode | null;
  onNodeUpdate: (updates: any) => void;
}

export function NodePreview({ node, onNodeUpdate }: NodePreviewProps) {
  const [activeTab, setActiveTab] = useState('config');
  
  if (!node) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Node Preview</CardTitle>
          <CardDescription>Select a node to preview its configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No node selected</p>
        </CardContent>
      </Card>
    );
  }

  // Handle node configuration updates
  const handleConfigUpdate = (newConfig: any) => {
    if (onNodeUpdate) {
      onNodeUpdate({
        id: node.id,
        data: {
          ...node.data,
          config: newConfig
        }
      });
    }
  };

  // Generate a JSON representation of the node
  const nodeJson = JSON.stringify(node, null, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{node.data?.label || node.type || 'Node'} Preview</CardTitle>
        <CardDescription>
          ID: {node.id} • Type: {node.type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 mt-2">
            {node.type === 'processing' && (
              <ProcessingConfigs
                processingType={node.data?.processingType || 'text'}
                branchingLogic={node.data?.branchingLogic || ''}
                transformType={node.data?.transformType || 'text'}
                config={node.data?.config || {}}
                onConfigChange={handleConfigUpdate}
              />
            )}
            
            {node.type === 'advancedProcessing' && (
              <AdvancedProcessingConfig
                config={node.data?.config || {}}
                onConfigChange={handleConfigUpdate}
              />
            )}
            
            {node.type === 'input' && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Input Content</h3>
                <p className="text-sm text-gray-500">
                  {node.data?.content || 'No content defined'}
                </p>
              </div>
            )}
            
            {node.type === 'aiModel' && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">AI Model Settings</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Model:</span> {node.data?.model || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Temperature:</span> {node.data?.temperature || '0.7'}
                  </div>
                  <div>
                    <span className="font-medium">Max Tokens:</span> {node.data?.maxTokens || '1024'}
                  </div>
                </div>
              </div>
            )}
            
            {node.type === 'output' && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Output Format</h3>
                <p className="text-sm text-gray-500">
                  {node.data?.format || 'text'}
                </p>
              </div>
            )}
            
            {!['processing', 'aiModel', 'input', 'output', 'advancedProcessing'].includes(node.type || '') && (
              <p className="text-gray-500">Configuration not available for this node type</p>
            )}
          </TabsContent>
          
          <TabsContent value="json" className="mt-2">
            <CodeBlock
              language="json"
              code={nodeJson}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
