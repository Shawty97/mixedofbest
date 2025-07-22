
import { NodeSelector } from "./NodeSelector";
import { Button } from "@/components/ui/button";
import { BarChart3, Settings, Eye, Code } from "lucide-react";
import { CustomNode } from "./types/workflow.types";

interface WorkflowActionsPanelProps {
  showPerformanceMonitor: () => void;
  previewWorkflow: () => void;
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  showWorkflowCode: () => void;
  node?: CustomNode;
  onClose?: () => void;
}

export function WorkflowActionsPanel({ 
  showPerformanceMonitor, 
  previewWorkflow, 
  isDebugMode, 
  toggleDebugMode,
  showWorkflowCode,
  node,
  onClose
}: WorkflowActionsPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <NodeSelector />
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full"
        onClick={showPerformanceMonitor}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Performance
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full" 
        onClick={previewWorkflow}
      >
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>
      <Button 
        size="sm" 
        variant={isDebugMode ? "default" : "outline"}
        className="w-full"
        onClick={toggleDebugMode}
      >
        <Settings className="h-4 w-4 mr-2" />
        {isDebugMode ? 'Debug: ON' : 'Debug: OFF'}
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full"
        onClick={showWorkflowCode}
      >
        <Code className="h-4 w-4 mr-2" />
        Export Code
      </Button>
      {onClose && (
        <Button 
          size="sm" 
          variant="ghost" 
          className="w-full"
          onClick={onClose}
        >
          Close
        </Button>
      )}
    </div>
  );
}
