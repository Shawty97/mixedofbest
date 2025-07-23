
import {
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background,
  Panel,
  BackgroundVariant
} from '@xyflow/react';
import { CustomNode, WorkflowContentProps } from "./types/workflow.types";
import { nodeTypes } from "./nodes/nodeTypes";

export function WorkflowContent({
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect, 
  onInit, 
  onDrop, 
  onDragOver, 
  onNodeClick,
  isDebugMode, 
  selectedNode, 
  debugPanel, 
  actionsPanel, 
  toolbar, 
  children,
  // New props from AdvancedWorkflowBuilder
  setNodes,
  setEdges,
  snapToGrid = false,
  darkMode = false,
  setSelectedNode
}: WorkflowContentProps) {
  // Ensure nodes and edges are always arrays to prevent mapping errors
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeEdges = Array.isArray(edges) ? edges : [];

  return (
    <div className={`h-[70vh] border border-gray-200 dark:border-gray-700 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <ReactFlow
        nodes={safeNodes}
        edges={safeEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={snapToGrid}
      >
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3} 
          zoomable 
          pannable 
          nodeColor={(node) => {
            if (!node) return '#64748b'; // Default color for undefined nodes
            switch (node.type) {
              case 'input': return '#22c55e';
              case 'aiModel': return '#3b82f6';
              case 'processing': return '#f59e0b';
              case 'output': return '#8b5cf6';
              case 'voiceToAgent': return '#8b5cf6'; // Added for the new node type
              default: return '#64748b';
            }
          }}
        />
        <Background gap={16} size={1} variant={BackgroundVariant.Dots} />
        {toolbar && <Panel position="top-left">{toolbar}</Panel>}
        {actionsPanel && <Panel position="top-right">{actionsPanel}</Panel>}
        {isDebugMode && selectedNode && debugPanel && (
          <Panel position="bottom-left">
            {debugPanel}
          </Panel>
        )}
        {children}
      </ReactFlow>
    </div>
  );
}
