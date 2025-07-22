
import { supabase } from "@/integrations/supabase/client";
import { SavedWorkflow } from "@/components/workflow/store/workflowStore";

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'failed' | 'running' | 'cancelled';
  executionTime?: number;
  tokenCount: number;
  cost: number;
  inputData: any;
  outputData: any;
  errorMessage?: string;
  nodePerformances: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export class WorkflowServiceEnhanced {
  // Load workflows with enhanced data
  static async loadWorkflows(): Promise<SavedWorkflow[]> {
    try {
      // Use type assertion since workflow_executions table isn't in auto-generated types yet
      const { data: workflows, error } = await (supabase as any)
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading workflows:', error);
        // Return empty array if table doesn't exist yet
        if (error.code === '42P01') { // relation does not exist
          console.log('Workflows table not found - returning empty array');
          return [];
        }
        return [];
      }

      return workflows?.map((workflow: any) => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || '',
        nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
        edges: Array.isArray(workflow.edges) ? workflow.edges : [],
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        version: workflow.version || 1,
        performance: {
          status: 'never_run',
          totalExecutionTime: workflow.average_execution_time || 0,
          totalTokenCount: 0,
          totalCost: workflow.total_cost || 0,
          nodes: {}
        },
        metadata: {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description || '',
          created: new Date(workflow.created_at),
          updated: new Date(workflow.updated_at),
          version: workflow.version || 1
        }
      })) || [];
    } catch (error) {
      console.error('Failed to load workflows:', error);
      return [];
    }
  }

  // Create workflow execution record
  static async createExecution(workflowId: string, inputData: any = {}): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: execution, error } = await (supabase as any)
        .from('workflow_executions')
        .insert([{
          workflow_id: workflowId,
          user_id: user.id,
          status: 'running',
          input_data: inputData,
          token_count: 0,
          cost: 0,
          node_performances: {}
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow execution:', error);
        // Return null if table doesn't exist yet
        if (error.code === '42P01') {
          console.log('Workflow executions table not found - skipping execution tracking');
          return null;
        }
        throw error;
      }
      
      return execution?.id || null;
    } catch (error) {
      console.error('Failed to create workflow execution:', error);
      return null;
    }
  }

  // Update execution with results
  static async updateExecution(
    executionId: string, 
    data: {
      status: 'success' | 'failed' | 'cancelled';
      executionTime?: number;
      tokenCount?: number;
      cost?: number;
      outputData?: any;
      errorMessage?: string;
      nodePerformances?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      if (!executionId) return false;

      const updateData: any = {
        status: data.status,
        completed_at: new Date().toISOString()
      };

      if (data.executionTime !== undefined) updateData.execution_time = data.executionTime;
      if (data.tokenCount !== undefined) updateData.token_count = data.tokenCount;
      if (data.cost !== undefined) updateData.cost = data.cost;
      if (data.outputData !== undefined) updateData.output_data = data.outputData;
      if (data.errorMessage !== undefined) updateData.error_message = data.errorMessage;
      if (data.nodePerformances !== undefined) updateData.node_performances = data.nodePerformances;

      const { error } = await (supabase as any)
        .from('workflow_executions')
        .update(updateData)
        .eq('id', executionId);

      if (error) {
        console.error('Error updating workflow execution:', error);
        // Return false if table doesn't exist yet
        if (error.code === '42P01') {
          console.log('Workflow executions table not found - skipping execution update');
          return false;
        }
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update workflow execution:', error);
      return false;
    }
  }

  // Get workflow analytics
  static async getWorkflowAnalytics(workflowId: string) {
    try {
      const { data: executions, error } = await (supabase as any)
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error getting workflow analytics:', error);
        // Return default analytics if table doesn't exist yet
        if (error.code === '42P01') {
          console.log('Workflow executions table not found - returning default analytics');
          return {
            successRate: 0,
            averageExecutionTime: 0,
            costEfficiency: 0,
            tokenUtilization: 0,
            totalExecutions: 0,
            recentExecutions: []
          };
        }
        throw error;
      }

      const total = executions?.length || 0;
      const successful = executions?.filter((e: any) => e.status === 'success').length || 0;
      const failed = executions?.filter((e: any) => e.status === 'failed').length || 0;
      
      const successfulExecutions = executions?.filter((e: any) => e.status === 'success' && e.execution_time) || [];
      const avgExecutionTime = successfulExecutions.length > 0 
        ? successfulExecutions.reduce((sum: number, e: any) => sum + (e.execution_time || 0), 0) / successfulExecutions.length 
        : 0;

      const totalTokens = executions?.reduce((sum: number, e: any) => sum + (e.token_count || 0), 0) || 0;
      const totalCost = executions?.reduce((sum: number, e: any) => sum + (e.cost || 0), 0) || 0;

      return {
        successRate: total > 0 ? (successful / total) * 100 : 0,
        averageExecutionTime: Math.round(avgExecutionTime),
        costEfficiency: totalCost,
        tokenUtilization: totalTokens,
        totalExecutions: total,
        recentExecutions: executions?.slice(0, 10) || []
      };
    } catch (error) {
      console.error('Failed to get workflow analytics:', error);
      return {
        successRate: 0,
        averageExecutionTime: 0,
        costEfficiency: 0,
        tokenUtilization: 0,
        totalExecutions: 0,
        recentExecutions: []
      };
    }
  }

  // Execute workflow with AI via OpenAI
  static async executeWorkflow(workflowId: string, inputData: any = {}) {
    const executionId = await this.createExecution(workflowId, inputData);
    
    const startTime = Date.now();
    let tokenCount = 0;
    let cost = 0;

    try {
      // Get workflow
      const { data: workflow, error } = await (supabase as any)
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) {
        console.error('Error getting workflow:', error);
        if (error.code === '42P01') {
          throw new Error('Workflows table not found');
        }
        throw error;
      }

      // Execute workflow nodes (simplified for now)
      const messages = [
        {
          role: 'system',
          content: 'You are a workflow execution engine. Execute the given workflow with the provided input data.'
        },
        {
          role: 'user',
          content: `Workflow: ${JSON.stringify(workflow.nodes)} Input: ${JSON.stringify(inputData)}`
        }
      ];

      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages,
          model: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 2000
        }
      });

      if (response.error) throw response.error;

      tokenCount = response.data?.usage?.total_tokens || 100;
      cost = tokenCount * 0.00001; // Approximate cost calculation

      const executionTime = Date.now() - startTime;

      if (executionId) {
        await this.updateExecution(executionId, {
          status: 'success',
          executionTime,
          tokenCount,
          cost,
          outputData: response.data,
          nodePerformances: {
            'total_time': executionTime,
            'ai_processing': executionTime * 0.8
          }
        });
      }

      return {
        success: true,
        data: response.data,
        executionTime,
        tokenCount,
        cost
      };

    } catch (error) {
      console.error('Workflow execution error:', error);
      
      if (executionId) {
        await this.updateExecution(executionId, {
          status: 'failed',
          executionTime: Date.now() - startTime,
          tokenCount,
          cost,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
