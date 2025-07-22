import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Save, ChevronDown, Plus, PlayCircle, StopCircle, Download, Upload, GitBranch, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import useWorkflowStore, { SavedWorkflow } from "./store/workflowStore";
import { toast } from "@/hooks/use-toast";
import { WorkflowToolbarProps } from "./types/workflow.types";

export function WorkflowToolbar(props: WorkflowToolbarProps) {
  const {
    workflowName = "",
    onWorkflowNameChange = () => {},
    saveWorkflow = () => {},
    isExecuting = false,
    createNewWorkflow = () => {},
    workflows = [],
    loadWorkflow = () => {},
    executeWorkflow = () => {},
    exportWorkflow = () => {},
    importWorkflow = () => {},
    isDebugMode = false,
    toggleDebugMode = () => {},
    zoomLevel = 1,
    handleZoomIn = () => {},
    handleZoomOut = () => {},
    handleZoomReset = () => {},
    // New props from AdvancedWorkflowBuilder
    onToggleNodeDrawer,
    onToggleConfigDrawer,
    onToggleDebugPanel,
    onTogglePerformancePanel,
    onSave,
    onNew,
    isLoading,
  } = props;
  
  const [isSyncing, setIsSyncing] = useState(false);
  const syncWithSupabase = useWorkflowStore(state => state.syncWithSupabase);
  const getUserWorkflows = useWorkflowStore(state => state.getUserWorkflows);
  const currentWorkflow = useWorkflowStore(state => state.getCurrentWorkflow());
  
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithSupabase();
      toast({
        title: "Workflows Synchronized",
        description: "Your workflows have been synchronized with the server.",
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Failed",
        description: "Could not synchronize with the server.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Get workflows and ensure they're in the correct format with safe fallbacks
  const userWorkflows = getUserWorkflows() || [];
  const formattedWorkflows = userWorkflows.map(workflow => {
    if (!workflow) return null;
    
    // Create a safe workflow object with fallbacks for all potentially missing properties
    return {
      ...workflow,
      id: workflow.id || `workflow-${Date.now()}`,
      name: workflow.name || "Untitled Workflow",
      description: workflow.description || "",
      metadata: workflow.metadata || {
        id: workflow.id || `workflow-${Date.now()}`,
        name: workflow.name || "Untitled Workflow",
        description: workflow.description || "",
        created: new Date(workflow.created_at || Date.now()),
        updated: new Date(workflow.updated_at || Date.now()),
        version: workflow.version || 1
      }
    };
  }).filter(Boolean) as SavedWorkflow[]; // Filter out null values and cast to SavedWorkflow[]
  
  // Use provided handlers if available, otherwise fall back to defaults
  const handleSave = onSave || saveWorkflow;
  const handleNew = onNew || createNewWorkflow;
  const handleExecute = executeWorkflow;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Input
          className="h-8 text-sm w-40"
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          placeholder="Workflow Name"
        />
        <Button size="sm" variant="outline" onClick={handleSave} disabled={isExecuting || isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save
            </>
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleSync} disabled={isSyncing}>
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="flex space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="flex-grow" disabled={isExecuting}>
              Workflows ({formattedWorkflows.length})
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </DropdownMenuItem>
            
            {formattedWorkflows.length > 0 && <DropdownMenuSeparator />}
            
            {formattedWorkflows.map((workflow) => (
              <DropdownMenuItem 
                key={workflow.metadata?.id || workflow.id}
                onClick={() => loadWorkflow(workflow)}
                className="flex items-center justify-between group"
              >
                <span className="truncate max-w-[180px]">
                  {workflow.metadata?.name || workflow.name || "Untitled Workflow"}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  v{workflow.metadata?.version || workflow.version || 1}
                </span>
              </DropdownMenuItem>
            ))}
            
            {formattedWorkflows.length === 0 && (
              <div className="px-2 py-1 text-sm text-gray-500">No workflows available</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          size="sm" 
          variant={isExecuting ? "outline" : "default"}
          onClick={handleExecute}
          disabled={isExecuting || !currentWorkflow}
          className={isExecuting ? "animate-pulse" : ""}
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-1" />
              Execute
            </>
          )}
        </Button>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={exportWorkflow}
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={importWorkflow}
        >
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
      </div>
      <div className="mt-3 flex space-x-2">
        <Button 
          size="sm" 
          variant={isDebugMode ? "default" : "outline"} 
          className="flex-1"
          onClick={toggleDebugMode}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          {isDebugMode ? 'Debug: ON' : 'Debug: OFF'}
        </Button>
        
        {currentWorkflow && (
          <Button
            size="sm"
            variant="outline"
            className="w-10 flex-none hover:bg-red-50 hover:text-red-600 transition-colors"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this workflow?")) {
                useWorkflowStore.getState().deleteWorkflow(
                  currentWorkflow.metadata?.id || currentWorkflow.id
                );
                handleNew();
                toast({
                  title: "Workflow Deleted",
                  description: "The workflow has been permanently deleted."
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex justify-between mt-3">
        <Button size="icon" variant="outline" onClick={handleZoomOut}>
          -
        </Button>
        <Button size="sm" variant="ghost" onClick={handleZoomReset}>
          {Math.round(zoomLevel * 100)}%
        </Button>
        <Button size="icon" variant="outline" onClick={handleZoomIn}>
          +
        </Button>
      </div>
    </div>
  );
}
