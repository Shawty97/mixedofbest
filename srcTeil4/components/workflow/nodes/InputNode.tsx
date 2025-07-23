import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { NodeDataProps } from '../types/workflow.types';

function InputNodeComponent({ data, isConnectable }: { data: NodeDataProps; isConnectable: boolean }) {
  return (
    <div className="p-4 border rounded-md border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-800 w-[220px]">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
        <div className="font-medium text-green-700 dark:text-green-300">{data.label || 'Input'}</div>
      </div>
      
      <div className="mb-2">
        <Textarea
          className="nodrag resize-none"
          placeholder="Enter prompt or data source..."
          value={data.content || ''}
          onChange={(e) => {
            if (data.onChange) {
              data.onChange(e.target.value);
            }
          }}
          rows={3}
        />
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-600 border-2 border-white dark:border-gray-800"
      />
    </div>
  );
}

export const InputNode = memo(InputNodeComponent);
