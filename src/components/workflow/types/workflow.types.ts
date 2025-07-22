
import { Node, Edge, NodeChange, EdgeChange, Connection, ConnectionLineType, OnConnectStartParams } from '@xyflow/react';
import { MutableRefObject, ReactNode } from 'react';

export type CustomNode = Node & {
  data?: NodeDataProps;
  type?: string;
};

export interface NodeDataProps {
  label?: string;
  description?: string;
  content?: string;
  config?: any;
  processingType?: string;
  branchingLogic?: string;
  transformType?: string;
  advancedConfig?: any;
  model?: string;
  provider?: string;
  temperature?: string;
  maxTokens?: string;
  format?: string;
  result?: any;
  code?: string;
  visualData?: string;
  metrics?: {
    tokens?: number;
    time?: number;
    optimizationScore?: number;
    qualityScore?: number;
  };
  outputType?: string;
  onChange?: (value: string) => void;
  onConfigChange?: (config: any) => void;
  onProcessingTypeChange?: (value: string) => void;
  onBranchingLogicChange?: (value: string) => void;
  onTransformTypeChange?: (value: string) => void;
}

export interface WorkflowDebugPanelProps {
  selectedNode: CustomNode | null;
  edges: Edge[];
}

export interface PerformanceMonitorProps {
  workflow: any;
}

export interface WorkflowToolbarProps {
  workflowName?: string;
  onWorkflowNameChange?: (val: string) => void;
  saveWorkflow?: () => void;
  isExecuting?: boolean;
  createNewWorkflow?: () => void;
  workflows?: any[];
  loadWorkflow?: (wf: any) => void;
  executeWorkflow?: () => void;
  exportWorkflow?: () => void;
  importWorkflow?: () => void;
  isDebugMode?: boolean;
  toggleDebugMode?: () => void;
  zoomLevel?: number;
  handleZoomIn?: () => void;
  handleZoomOut?: () => void;
  handleZoomReset?: () => void;
  // Properties used in AdvancedWorkflowBuilder
  onToggleNodeDrawer?: () => void;
  onToggleConfigDrawer?: () => void;
  onToggleDebugPanel?: () => void;
  onTogglePerformancePanel?: () => void;
  onSave?: () => Promise<void>;
  onNew?: () => void;
  isLoading?: boolean;
}

export interface WorkflowDrawersProps {
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  previewWorkflowJson: any;
  isPerformanceOpen: boolean;
  setIsPerformanceOpen: (open: boolean) => void;
  children?: ReactNode;
  showNodeDrawer?: boolean;
  showConfigDrawer?: boolean;
  setShowNodeDrawer?: (show: boolean) => void;
  setShowConfigDrawer?: (show: boolean) => void;
  appContainer?: MutableRefObject<HTMLDivElement | null>;
}

export interface WorkflowActionsPanelProps {
  showPerformanceMonitor: () => void;
  previewWorkflow: () => void;
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  showWorkflowCode: () => void;
  node?: CustomNode;
  onClose?: () => void;
}

export interface WorkflowContentProps {
  nodes: CustomNode[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onInit: any;
  onDrop: any;
  onDragOver: any;
  onNodeClick: any;
  isDebugMode: boolean;
  selectedNode: CustomNode | null;
  debugPanel: React.ReactNode;
  actionsPanel: React.ReactNode;
  toolbar: React.ReactNode;
  children?: ReactNode;
  // Properties used in AdvancedWorkflowBuilder
  setNodes?: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  setEdges?: React.Dispatch<React.SetStateAction<any[]>>;
  snapToGrid?: boolean;
  darkMode?: boolean;
  setSelectedNode?: React.Dispatch<React.SetStateAction<CustomNode | null>>;
}

export interface ExecutionPanelProps {
  workflow?: any;
}
