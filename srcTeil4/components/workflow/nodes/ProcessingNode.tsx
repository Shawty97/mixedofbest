import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code, GitBranch, Workflow, Slice } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ProcessingTypeSelect } from './processing/ProcessingTypeSelect';
import { ProcessingConfigs } from './processing/ProcessingConfigs';
import { NodeDataProps } from '../types/workflow.types';

function ProcessingNodeComponent({ data, isConnectable }: { data: NodeDataProps; isConnectable: boolean }) {
  const processingType = data.processingType || 'transform';
  const branchingLogic = data.branchingLogic || 'none';
  const transformType = data.transformType || 'json';
  const advancedConfig = data.advancedConfig || {};
  
  const handleConfigChange = (config: any) => {
    if (data.onConfigChange) {
      data.onConfigChange(config);
    }
  };
  
  return (
    <div className="p-4 border rounded-md border-amber-500 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 w-[280px]">
      <div className="flex items-center gap-2 mb-2">
        <Code className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <div className="font-medium text-amber-700 dark:text-amber-300">{data.label || 'Processing'}</div>
      </div>
      
      <div className="space-y-3">
        <ProcessingTypeSelect 
          processingType={processingType}
          onProcessingTypeChange={(value) => {
            if (data.onProcessingTypeChange) {
              data.onProcessingTypeChange(value);
            }
          }}
        />
        
        {processingType === 'branch' && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Branching Logic</Label>
            <Select 
              value={branchingLogic} 
              onValueChange={(value) => {
                if (data.onBranchingLogicChange) {
                  data.onBranchingLogicChange(value);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select branching type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Branching</SelectItem>
                <SelectItem value="conditional">Conditional (If/Else)</SelectItem>
                <SelectItem value="multipath">Multi-path Routing</SelectItem>
                <SelectItem value="switch">Switch Case</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {processingType === 'transform' && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Transform Type</Label>
            <Select 
              value={transformType} 
              onValueChange={(value) => {
                if (data.onTransformTypeChange) {
                  data.onTransformTypeChange(value);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select transform type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON Transform</SelectItem>
                <SelectItem value="text">Text Processing</SelectItem>
                <SelectItem value="filter">Data Filtering</SelectItem>
                <SelectItem value="custom">Custom Transform</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <ProcessingConfigs 
          processingType={processingType} 
          branchingLogic={branchingLogic}
          transformType={transformType}
          config={advancedConfig}
          onConfigChange={handleConfigChange}
        />
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-amber-600 border-2 border-white dark:border-gray-800"
      />
      
      {/* Standard output handle for all processing types */}
      <Handle
        type="source"
        position={Position.Right}
        id="default"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-amber-600 border-2 border-white dark:border-gray-800"
      />
      
      {/* Conditional output handles for branching nodes */}
      {processingType === 'branch' && branchingLogic === 'conditional' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: '30%' }}
            isConnectable={isConnectable}
            className="w-3 h-3 bg-green-600 border-2 border-white dark:border-gray-800"
          />
          <div className="absolute bottom-1 left-[30%] transform -translate-x-1/2 text-[10px] text-green-600">True</div>
          
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: '70%' }}
            isConnectable={isConnectable}
            className="w-3 h-3 bg-red-600 border-2 border-white dark:border-gray-800"
          />
          <div className="absolute bottom-1 left-[70%] transform -translate-x-1/2 text-[10px] text-red-600">False</div>
        </>
      )}
      
      {/* Multi-path routing handles */}
      {processingType === 'branch' && branchingLogic === 'multipath' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="path-a"
            style={{ left: '25%' }}
            isConnectable={isConnectable}
            className="w-3 h-3 bg-blue-600 border-2 border-white dark:border-gray-800"
          />
          <div className="absolute bottom-1 left-[25%] transform -translate-x-1/2 text-[10px] text-blue-600">A</div>
          
          <Handle
            type="source"
            position={Position.Bottom}
            id="path-b"
            style={{ left: '50%' }}
            isConnectable={isConnectable}
            className="w-3 h-3 bg-purple-600 border-2 border-white dark:border-gray-800"
          />
          <div className="absolute bottom-1 left-[50%] transform -translate-x-1/2 text-[10px] text-purple-600">B</div>
          
          <Handle
            type="source"
            position={Position.Bottom}
            id="path-c"
            style={{ left: '75%' }}
            isConnectable={isConnectable}
            className="w-3 h-3 bg-amber-600 border-2 border-white dark:border-gray-800"
          />
          <div className="absolute bottom-1 left-[75%] transform -translate-x-1/2 text-[10px] text-amber-600">C</div>
        </>
      )}
    </div>
  );
}

export const ProcessingNode = memo(ProcessingNodeComponent);
