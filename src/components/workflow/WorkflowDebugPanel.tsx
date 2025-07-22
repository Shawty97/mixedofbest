
import { Card } from "@/components/ui/card";
import { Edge } from "@xyflow/react";
import { CustomNode } from "./types/workflow.types";

interface WorkflowDebugPanelProps {
  selectedNode: CustomNode | null;
  edges: Edge[];
}

export function WorkflowDebugPanel({ selectedNode, edges }: WorkflowDebugPanelProps) {
  if (!selectedNode) return null;
  return (
    <Card className="p-3 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <h3 className="text-sm font-medium">{selectedNode.id} Debug</h3>
      <div className="text-xs mt-1 space-y-1">
        <div>Type: {selectedNode.type}</div>
        <div>
          Connections: {edges.filter(e => 
            e.source === selectedNode.id || e.target === selectedNode.id
          ).length}
        </div>
        {selectedNode.type === 'aiModel' && (
          <>
            <div>Model: {selectedNode.data?.model || 'Not set'}</div>
            <div>Provider: {selectedNode.data?.provider || 'Not set'}</div>
          </>
        )}
        {selectedNode.type === 'processing' && (
          <>
            <div>Type: {selectedNode.data?.processingType || 'Not set'}</div>
            <div>Branching: {selectedNode.data?.branchingLogic || 'None'}</div>
          </>
        )}
      </div>
    </Card>
  );
}
