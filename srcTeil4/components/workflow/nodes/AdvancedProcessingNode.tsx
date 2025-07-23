import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';
import { NodeDataProps } from '../types/workflow.types';

function AdvancedProcessingNodeComponent({ data, isConnectable }: { data: NodeDataProps; isConnectable: boolean }) {
  return (
    <div className="p-4 border rounded-md border-amber-500 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <div className="font-medium text-amber-700 dark:text-amber-300">{data.label || 'Advanced Processing'}</div>
      </div>
      
      <div className="mb-2 text-sm text-amber-700 dark:text-amber-300">
        {data.description || 'Perform complex data transformations with advanced options'}
      </div>
      
      <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
        {data.config?.errorHandling && (
          <div className="flex justify-between">
            <span>Error Handling:</span>
            <span className="font-medium">{data.config.errorHandling}</span>
          </div>
        )}
        
        {data.config?.retryOptions && data.config.retryOptions !== 'none' && (
          <div className="flex justify-between">
            <span>Retries:</span>
            <span className="font-medium">{data.config.retryOptions} ({data.config.maxRetries || 3})</span>
          </div>
        )}
        
        {data.config?.cacheResults && (
          <div className="flex justify-between">
            <span>Cache:</span>
            <span className="font-medium">Enabled</span>
          </div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-amber-600 border-2 border-white dark:border-gray-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-amber-600 border-2 border-white dark:border-gray-800"
      />
    </div>
  );
}

export const AdvancedProcessingNode = memo(AdvancedProcessingNodeComponent);
