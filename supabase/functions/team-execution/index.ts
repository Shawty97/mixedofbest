
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TeamExecutionRequest {
  teamId: string;
  inputData: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { teamId, inputData }: TeamExecutionRequest = await req.json()

    // Get team configuration
    const { data: team, error: teamError } = await supabase
      .from('agent_teams')
      .select('*, team_members(*, workflows(*))')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      throw new Error('Team not found')
    }

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('team_executions')
      .insert({
        team_id: teamId,
        input_data: inputData,
        status: 'running'
      })
      .select()
      .single()

    if (execError) {
      throw new Error('Failed to create execution')
    }

    // Sort team members by priority (managers first)
    const sortedMembers = team.team_members.sort((a: any, b: any) => b.priority - a.priority)

    // Execute coordination logic
    const results: any[] = []
    
    for (const member of sortedMembers) {
      try {
        // Simulate agent execution
        const agentResult = await executeAgent(member, inputData)
        results.push({
          agentId: member.id,
          result: agentResult,
          status: 'completed'
        })

        // Log communication
        await supabase
          .from('agent_communications')
          .insert({
            team_id: teamId,
            from_agent_id: member.id,
            message_type: 'result',
            content: agentResult,
            status: 'delivered'
          })

      } catch (error) {
        results.push({
          agentId: member.id,
          error: error.message,
          status: 'failed'
        })
      }
    }

    // Update execution with results
    await supabase
      .from('team_executions')
      .update({
        results: { agents: results },
        status: 'completed',
        completed_at: new Date().toISOString(),
        performance_metrics: {
          total_agents: sortedMembers.length,
          successful_agents: results.filter(r => r.status === 'completed').length,
          execution_time: Date.now() - new Date(execution.started_at).getTime()
        }
      })
      .eq('id', execution.id)

    return new Response(
      JSON.stringify({
        success: true,
        executionId: execution.id,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function executeAgent(member: any, inputData: any): Promise<any> {
  // Simulate agent execution based on role
  const role = member.role
  const delay = Math.random() * 2000 + 500 // 0.5-2.5s delay

  await new Promise(resolve => setTimeout(resolve, delay))

  switch (role) {
    case 'manager':
      return {
        type: 'coordination',
        message: 'Task distributed to team members',
        delegated_to: ['worker1', 'worker2'],
        timestamp: new Date().toISOString()
      }
    
    case 'worker':
      return {
        type: 'task_completion',
        message: 'Task completed successfully',
        processed_data: inputData,
        output: `Processed by ${member.agent_workflow_id}`,
        timestamp: new Date().toISOString()
      }
    
    case 'coordinator':
      return {
        type: 'coordination',
        message: 'Team coordination successful',
        coordination_actions: ['sync_status', 'resolve_conflicts'],
        timestamp: new Date().toISOString()
      }
    
    default:
      return {
        type: 'general',
        message: 'Agent execution completed',
        data: inputData,
        timestamp: new Date().toISOString()
      }
  }
}
