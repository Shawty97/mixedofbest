import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { InputNode } from './nodes/InputNode';
import { OutputNode } from './nodes/OutputNode';
import { AIModelNode } from './nodes/AIModelNode';
import { ProcessingNode } from './nodes/ProcessingNode';
import { Sidebar } from './Sidebar';
import { WorkflowContent } from './WorkflowContent';
import { CustomNode } from "./types/workflow.types";
import { WorkflowToolbar } from "./WorkflowToolbar";
import useWorkflowStore from "./store/workflowStore";
import { toast } from "@/hooks/use-toast";
import { ExecutionPanel } from './ExecutionPanel';
import { Loader2 } from 'lucide-react';
import { useWorkflowExecution } from '@/hooks/use-workflow-execution';

export function AdvancedWorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nodeDrawerOpen, setNodeDrawerOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const [performancePanelOpen, setPerformancePanelOpen] = useState(false);
  const reactFlowInstance = useReactFlow();
  const workflows = useWorkflowStore(state => state.workflows);
  const currentWorkflowId = useWorkflowStore(state => state.currentWorkflowId);
  const addWorkflow = useWorkflowStore(state => state.addWorkflow);
  const setCurrentWorkflow = useWorkflowStore(state => state.setCurrentWorkflow);
  const getCurrentWorkflow = useWorkflowStore(state => state.getCurrentWorkflow);
  const createNode = useWorkflowStore(state => state.createNode);
  const { executeWorkflow: runWorkflow, isExecuting } = useWorkflowExecution();

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (event: any, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  // Create a wrapper function that matches the expected signature
  const handleCreateNode = useCallback((type: string, position: { x: number; y: number }) => {
    // The createNode function from the store expects only the type parameter
    createNode(type);
    // Return a unique node ID since the store function returns void
    return `${type}-${Date.now()}`;
  }, [createNode]);

  const handleSaveWorkflow = useCallback(async () => {
    setIsSaving(true);
    try {
      const workflowToSave = {
        id: currentWorkflowId || `workflow-${Date.now()}`,
        name: workflowName,
        nodes: nodes,
        edges: edges,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        metadata: {
          id: currentWorkflowId || `workflow-${Date.now()}`,
          name: workflowName,
          description: '',
          created: new Date(),
          updated: new Date(),
          version: 1
        }
      };

      let workflowId = currentWorkflowId;
      if (currentWorkflowId) {
        // Update existing workflow (not implemented yet)
      } else {
        workflowId = addWorkflow(workflowToSave);
      }

      if (workflowId) {
        setCurrentWorkflow(workflowId);
        toast({
          title: "Workflow Saved",
          description: "Your workflow has been saved successfully.",
        });
      } else {
        toast({
          title: "Failed to Save Workflow",
          description: "There was an error saving your workflow.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Could not save the workflow.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, workflowName, currentWorkflowId, addWorkflow, setCurrentWorkflow]);

  const handleCreateNewWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('Untitled Workflow');
    setSelectedNode(null);
    setCurrentWorkflow(null);
  }, [setNodes, setEdges, setCurrentWorkflow]);

  const handleLoadWorkflow = useCallback((workflow: any) => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setWorkflowName(workflow.name);
    setCurrentWorkflow(workflow.id);
  }, [setNodes, setEdges, setWorkflowName, setCurrentWorkflow]);

  const handleExportWorkflow = useCallback(() => {
    const workflow = {
      nodes: nodes,
      edges: edges,
      name: workflowName,
    };
    const dataStr = JSON.stringify(workflow);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'workflow.json';
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges, workflowName]);

  const handleImportWorkflow = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const workflow = JSON.parse(e.target.result);
            setNodes(workflow.nodes || []);
            setEdges(workflow.edges || []);
            setWorkflowName(workflow.name || 'Untitled Workflow');
            toast({
              title: "Workflow Imported",
              description: "The workflow has been imported successfully.",
            });
          } catch (error) {
            console.error("Import error:", error);
            toast({
              title: "Import Failed",
              description: "Could not import the workflow. Invalid JSON format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    });
    fileInput.click();
  }, [setNodes, setEdges, setWorkflowName]);

  const handleToggleDebugMode = useCallback(() => {
    setIsDebugMode(!isDebugMode);
  }, [isDebugMode]);

  const handleExecuteWorkflow = useCallback(async () => {
    const currentWorkflow = getCurrentWorkflow();
    if (!currentWorkflow) {
      toast({
        title: "No workflow selected",
        description: "Please save your workflow first before executing",
        variant: "destructive"
      });
      return;
    }

    // Update current workflow with latest changes
    const updatedWorkflow = {
      ...currentWorkflow,
      nodes,
      edges,
      name: workflowName,
      updated_at: new Date().toISOString()
    };

    await runWorkflow(updatedWorkflow);
  }, [getCurrentWorkflow, nodes, edges, workflowName, runWorkflow]);

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex h-full">
        <Sidebar
          isOpen={nodeDrawerOpen}
          onClose={() => setNodeDrawerOpen(false)}
          onCreateNode={handleCreateNode}
        />

        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <WorkflowToolbar
              workflowName={workflowName}
              onWorkflowNameChange={setWorkflowName}
              executeWorkflow={handleExecuteWorkflow}
              isExecuting={isExecuting}
              workflows={workflows}
              loadWorkflow={handleLoadWorkflow}
              exportWorkflow={handleExportWorkflow}
              importWorkflow={handleImportWorkflow}
              isDebugMode={isDebugMode}
              toggleDebugMode={handleToggleDebugMode}
              zoomLevel={1}
              handleZoomIn={() => {}}
              handleZoomOut={() => {}}
              handleZoomReset={() => {}}
              onSave={handleSaveWorkflow}
              onNew={handleCreateNewWorkflow}
              isLoading={isSaving}
              onToggleNodeDrawer={() => setNodeDrawerOpen(!nodeDrawerOpen)}
              onToggleConfigDrawer={() => setConfigDrawerOpen(!configDrawerOpen)}
              onToggleDebugPanel={() => setDebugPanelOpen(!debugPanelOpen)}
              onTogglePerformancePanel={() => setPerformancePanelOpen(!performancePanelOpen)}
            />
          </div>

          <div className="flex-1">
            <WorkflowContent
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={reactFlowInstance.setViewport}
              onDrop={() => {}}
              onDragOver={() => {}}
              onNodeClick={handleNodeClick}
              isDebugMode={isDebugMode}
              selectedNode={selectedNode}
              setNodes={setNodes}
              setEdges={setEdges}
              setSelectedNode={setSelectedNode}
              debugPanel={<div>Debug Panel</div>}
              actionsPanel={<div>Actions Panel</div>}
              toolbar={<div>Toolbar</div>}
            />
          </div>

          {getCurrentWorkflow() && (
            <ExecutionPanel workflow={getCurrentWorkflow()!} />
          )}
        </div>
      </div>
    </div>
  );
}
