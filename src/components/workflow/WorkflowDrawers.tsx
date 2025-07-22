
import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { NodePreview } from "./NodePreview";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { SavedWorkflow } from "./store/workflowStore";
import { CustomNode } from "./types/workflow.types";

interface WorkflowDrawersProps {
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  previewWorkflowJson: any;
  isPerformanceOpen: boolean;
  setIsPerformanceOpen: (open: boolean) => void;
  children?: React.ReactNode;
  // For the current implementation
  showNodeDrawer?: boolean;
  showConfigDrawer?: boolean;
  setShowNodeDrawer?: (show: boolean) => void;
  setShowConfigDrawer?: (show: boolean) => void;
  appContainer?: React.MutableRefObject<HTMLDivElement | null>;
}

export function WorkflowDrawers({
  isPreviewOpen,
  setIsPreviewOpen,
  previewWorkflowJson,
  isPerformanceOpen,
  setIsPerformanceOpen,
  children,
  showNodeDrawer,
  showConfigDrawer
}: WorkflowDrawersProps) {
  // Convert the preview JSON to the format expected by NodePreview
  const previewWorkflow: SavedWorkflow = {
    id: previewWorkflowJson.id || 'preview',
    name: previewWorkflowJson.name || 'Preview Workflow',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
    nodes: previewWorkflowJson.nodes || [],
    edges: previewWorkflowJson.edges || [],
    description: "Preview workflow"
  };

  // Create a mock node for preview and a no-op update function
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(
    previewWorkflowJson.nodes && previewWorkflowJson.nodes.length > 0 
      ? previewWorkflowJson.nodes[0] 
      : null
  );

  const handleNodeUpdate = (updates: any) => {
    console.log("Node update in preview mode:", updates);
    // In preview mode, we don't actually update the nodes
  };

  return (
    <>
      {children}
      
      {/* Preview Drawer */}
      <Drawer open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>Workflow Preview</DrawerTitle>
            <DrawerClose asChild>
              <Button size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <NodePreview node={selectedNode} onNodeUpdate={handleNodeUpdate} />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Performance Monitor Drawer */}
      <Drawer open={isPerformanceOpen} onOpenChange={setIsPerformanceOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>Performance Monitor</DrawerTitle>
            <DrawerClose asChild>
              <Button size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <PerformanceMonitor workflow={previewWorkflow} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
