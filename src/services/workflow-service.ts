import { supabase } from '@/integrations/supabase/client';
import { SavedWorkflow } from '@/components/workflow/store/workflowStore';
import { workflowExecutor } from './dag-engine/WorkflowExecutor';

export interface WorkflowExecutionResult {
  status: 'success' | 'error';
  executionTime: number;
  timestamp: string;
  nodeResults: any[];
  finalOutput?: any;
  errors?: string[];
}

// Get all workflows for the current user
export async function getUserWorkflows(): Promise<SavedWorkflow[]> {
  try {
    if (!supabase) throw new Error("Supabase client is not available");
    
    const { data: workflowData, error } = await supabase
      .from('workflows')
      .select('*');
      
    if (error) throw error;
    
    // Convert database format to app format
    return workflowData.map((dbWorkflow: any) => ({
      id: dbWorkflow.id,
      name: dbWorkflow.name,
      description: dbWorkflow.description,
      nodes: dbWorkflow.nodes || [],
      edges: dbWorkflow.edges || [],
      created_at: dbWorkflow.created_at,
      updated_at: dbWorkflow.updated_at,
      version: dbWorkflow.version || 1,
      performance: dbWorkflow.performance || {
        status: "idle",
        totalExecutionTime: 0,
        totalTokenCount: 0,
        totalCost: 0,
        nodes: {}
      }
    }));
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return [];
  }
}

// Save a workflow to the database
export async function saveWorkflow(workflow: SavedWorkflow): Promise<string | null> {
  try {
    if (!supabase) throw new Error("Supabase client is not available");
    
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      throw new Error("No authenticated user found");
    }
    
    // Only include fields that match the Supabase schema
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        nodes: JSON.stringify(workflow.nodes),
        edges: JSON.stringify(workflow.edges),
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        user_id: userData.user.id
      });
      
    if (error) throw error;
    
    return workflow.id;
  } catch (error) {
    console.error("Error saving workflow:", error);
    return null;
  }
}

// Update an existing workflow in the database
export async function updateWorkflow(id: string, updates: Partial<SavedWorkflow>): Promise<boolean> {
  try {
    if (!supabase) throw new Error("Supabase client is not available");
    
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    updateData.updated_at = new Date().toISOString();
    
    if (updates.nodes) updateData.nodes = JSON.stringify(updates.nodes);
    if (updates.edges) updateData.edges = JSON.stringify(updates.edges);
    
    const { error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating workflow:", error);
    return false;
  }
}

// Delete a workflow from the database
export async function deleteWorkflow(id: string): Promise<boolean> {
  try {
    if (!supabase) throw new Error("Supabase client is not available");
    
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return false;
  }
}

// Execute a workflow using the new DAG engine
export async function executeWorkflow(workflow: SavedWorkflow): Promise<WorkflowExecutionResult> {
  try {
    console.log('Executing workflow with DAG engine:', workflow.name);
    
    // Use the new DAG-based workflow executor
    const result = await workflowExecutor.execute(workflow, {
      maxConcurrency: 3,
      timeout: 300000, // 5 minutes
      retryOptions: {
        maxRetries: 3,
        retryDelay: 1000
      }
    });
    
    // Convert DAG execution result to the expected format
    return {
      status: result.status === 'completed' ? 'success' : 'error',
      executionTime: result.totalDuration,
      timestamp: result.endTime.toISOString(),
      nodeResults: Array.from(result.nodeResults.entries()).map(([nodeId, result]) => ({
        id: nodeId,
        type: workflow.nodes.find(n => n.id === nodeId)?.type || 'unknown',
        status: result ? 'success' : 'error',
        executionTime: 0, // This would be calculated from node metadata
        result
      })),
      finalOutput: result.finalOutput,
      errors: result.errors.size > 0 ? Array.from(result.errors.values()) : undefined
    };
  } catch (error) {
    console.error("Error executing workflow with DAG engine:", error);
    
    // Fallback to mock execution for demonstration
    return {
      status: 'error',
      executionTime: 0,
      timestamp: new Date().toISOString(),
      nodeResults: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Get workflow execution history
export async function getWorkflowExecutionHistory(workflowId: string): Promise<WorkflowExecutionResult[]> {
  try {
    // For now, return mock data as the workflow_executions table doesn't exist yet
    // We would need to create this table in the Supabase schema
    
    // Return mock history data for demonstration
    return Array.from({ length: 5 }, (_, i) => ({
      status: Math.random() > 0.2 ? 'success' as const : 'error' as const,
      executionTime: Math.floor(Math.random() * 1500) + 500,
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      nodeResults: [],
      finalOutput: {
        text: "Simulated historical execution result",
        confidence: 0.8 + (Math.random() * 0.2),
      }
    }));
  } catch (error) {
    console.error("Error fetching workflow execution history:", error);
    
    // Return empty array on error
    return [];
  }
}

// Create a new key for deploying the workflow
export async function createDeploymentKey(workflowId: string, name: string): Promise<string | null> {
  try {
    // Generate a random API key
    const apiKey = `wf_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // In a real implementation with existing tables, we would use:
    // const { error } = await supabase.from('workflow_api_keys').insert({
    //   workflow_id: workflowId,
    //   name: name,
    //   api_key: apiKey,
    //   created_at: new Date().toISOString()
    // });
    
    return apiKey;
  } catch (error) {
    console.error("Error creating deployment key:", error);
    return null;
  }
}

// Deploy a workflow to make it publicly accessible
export async function deployWorkflow(workflowId: string): Promise<string | null> {
  try {
    // In a real implementation with existing tables, we would use:
    // const { error } = await supabase.from('workflows')
    //   .update({ 
    //     is_deployed: true,
    //     deployed_at: new Date().toISOString() 
    //   })
    //   .eq('id', workflowId);
    
    // Return mock URL for demonstration
    return `https://api.aiimpact-platform.com/workflows/${workflowId}/execute`;
  } catch (error) {
    console.error("Error deploying workflow:", error);
    
    // Return mock URL for demonstration
    return `https://api.aiimpact-platform.com/workflows/${workflowId}/execute`;
  }
}
