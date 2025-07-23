
import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from '@xyflow/react';

// Create placeholder initial nodes and edges until we create the utils file
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Define the SavedWorkflow type that will be used across the application
export interface SavedWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
  version: number;
  performance?: {
    status?: string;
    totalExecutionTime?: number;
    totalTokenCount?: number;
    totalCost?: number;
    nodes?: Record<string, any>;
  };
  metadata?: {
    id: string;
    name: string;
    description: string;
    created: Date;
    updated: Date;
    version: number;
  };
}

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  workflowName: string;
  selectedNodeId: string | null;
  workflows: SavedWorkflow[];
  currentWorkflowId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (id: string, data: any) => void;
  setWorkflowName: (name: string) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  createNode: (type: string) => void;
  addWorkflow: (workflow: SavedWorkflow) => string;
  setCurrentWorkflow: (id: string) => void;
  getCurrentWorkflow: () => SavedWorkflow | null;
  getUserWorkflows: () => SavedWorkflow[];
  syncWithSupabase: () => Promise<boolean>;
  deleteWorkflow: (id: string) => void;
  getWorkflowAnalytics: (workflowId: string) => {
    successRate: number;
    averageExecutionTime: number;
    costEfficiency: number;
    tokenUtilization: number;
  };
};

const useWorkflowStore = create<RFState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  workflowName: 'Untitled Workflow',
  selectedNodeId: null,
  workflows: [],
  currentWorkflowId: null,
  setNodes: (nodes: Node[]) => {
    set({ nodes });
  },
  setEdges: (edges: Edge[]) => {
    set({ edges });
  },
  setSelectedNodeId: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  updateNodeData: (id: string, data: any) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  setWorkflowName: (name: string) => {
    set({ workflowName: name });
  },
  addNode: (node: Node) => {
    set({ nodes: [...get().nodes, node] });
  },
  addEdge: (edge: Edge) => {
    set({ edges: [...get().edges, edge] });
  },
  removeNode: (id: string) => {
    set({ nodes: get().nodes.filter((node) => node.id !== id) });
  },
  removeEdge: (id: string) => {
    set({ edges: get().edges.filter((edge) => edge.id !== id) });
  },
  createNode: (type: string) => {
    const newNode = {
      id: String(Date.now()), // Convert to string to meet type requirements
      type: type,
      position: { x: 250, y: 250 } as XYPosition,
      data: { label: type },
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  addWorkflow: (workflow: SavedWorkflow) => {
    const id = workflow.id || `workflow-${Date.now()}`;
    const newWorkflow = {
      ...workflow,
      id,
    };
    
    set(state => ({
      workflows: [...state.workflows, newWorkflow]
    }));
    
    return id;
  },
  setCurrentWorkflow: (id: string) => {
    set({ currentWorkflowId: id });
    
    // Also load the workflow content
    const workflow = get().workflows.find(w => w.id === id);
    if (workflow) {
      set({
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        workflowName: workflow.name || 'Untitled Workflow'
      });
    }
  },
  getCurrentWorkflow: () => {
    const { workflows, currentWorkflowId } = get();
    return workflows.find(w => w.id === currentWorkflowId) || null;
  },
  getUserWorkflows: () => {
    return get().workflows;
  },
  syncWithSupabase: async () => {
    // In a real implementation, this would fetch workflows from Supabase
    // For now, just adding a sample workflow if none exist
    if (get().workflows.length === 0) {
      const demoWorkflow: SavedWorkflow = {
        id: 'demo-workflow-1',
        name: 'Demo Workflow',
        description: 'A sample workflow for demonstration',
        nodes: [],
        edges: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        performance: {
          status: 'success',
          totalExecutionTime: 1240,
          totalTokenCount: 450,
          totalCost: 0.023
        }
      };
      
      const workflowId = get().addWorkflow(demoWorkflow);
      get().setCurrentWorkflow(workflowId);
    }
    
    return true;
  },
  deleteWorkflow: (id: string) => {
    set(state => ({
      workflows: state.workflows.filter(w => w.id !== id)
    }));
    
    if (get().currentWorkflowId === id) {
      set({
        currentWorkflowId: null,
        nodes: [],
        edges: []
      });
    }
  },
  getWorkflowAnalytics: (workflowId: string) => {
    // Mock analytics data
    return {
      successRate: 89,
      averageExecutionTime: 1240,
      costEfficiency: 0.023,
      tokenUtilization: 450
    };
  }
}));

export default useWorkflowStore;
