import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow, Plus, Zap, ArrowRight, Brain } from 'lucide-react';
import { useEnhancedCopilotStore } from './store/enhancedCopilotStore';
import useWorkflowStore from '@/components/workflow/store/workflowStore';

export function WorkflowIntegration() {
  const { updateWorkflowContext, sendCommand } = useEnhancedCopilotStore();
  const { workflows, currentWorkflowId, getCurrentWorkflow, nodes } = useWorkflowStore();

  const currentWorkflow = getCurrentWorkflow();
  const selectedNodes = nodes.filter(node => node.selected) || [];

  React.useEffect(() => {
    // Update AI context with current workflow state
    updateWorkflowContext({
      currentWorkflow,
      selectedNodes: selectedNodes.map(node => node.id),
      workspaceData: {
        totalWorkflows: workflows.length,
        activeWorkflow: currentWorkflow?.name
      }
    });
  }, [currentWorkflow, selectedNodes, workflows, updateWorkflowContext]);

  const handleQuickAction = async (action: string) => {
    const commands = {
      addAINode: 'Add a new AI model node to the current workflow',
      optimizeWorkflow: 'Analyze and optimize the current workflow for better performance',
      explainWorkflow: 'Explain what this workflow does and how it works',
      debugWorkflow: 'Help me debug issues in the current workflow',
      connectNodes: 'Connect the selected nodes in the most logical sequence',
      generateDocumentation: 'Generate documentation for this workflow'
    };

    await sendCommand(commands[action as keyof typeof commands]);
  };

  const workflowSuggestions = [
    {
      title: 'Add AI Node',
      description: 'Insert a new AI processing node',
      action: 'addAINode',
      icon: Plus,
      color: 'bg-blue-500'
    },
    {
      title: 'Optimize Workflow',
      description: 'Improve performance and efficiency',
      action: 'optimizeWorkflow',
      icon: Zap,
      color: 'bg-green-500'
    },
    {
      title: 'Explain Workflow',
      description: 'Get detailed explanation',
      action: 'explainWorkflow',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      title: 'Debug Issues',
      description: 'Find and fix problems',
      action: 'debugWorkflow',
      icon: ArrowRight,
      color: 'bg-red-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-neural-600" />
          Workflow AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentWorkflow ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neural-50 rounded-lg">
              <div>
                <h3 className="font-medium">{currentWorkflow.name}</h3>
                <p className="text-sm text-gray-600">
                  {currentWorkflow.nodes.length} nodes • {selectedNodes.length} selected
                </p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {workflowSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.action}
                  variant="outline"
                  size="sm"
                  className="h-auto p-3 flex flex-col items-start gap-1"
                  onClick={() => handleQuickAction(suggestion.action)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={`h-6 w-6 ${suggestion.color} rounded flex items-center justify-center`}>
                      <suggestion.icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-medium">{suggestion.title}</span>
                  </div>
                  <span className="text-xs text-gray-500 text-left">
                    {suggestion.description}
                  </span>
                </Button>
              ))}
            </div>

            {selectedNodes.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-700 mb-2">
                  {selectedNodes.length} node(s) selected
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('connectNodes')}
                  className="w-full"
                >
                  Connect Selected Nodes
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Workflow className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active workflow</p>
            <p className="text-xs">Open a workflow to enable AI assistance</p>
          </div>
        )}

        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500 mb-2">Quick AI Commands:</p>
          <div className="flex flex-wrap gap-1">
            {[
              'Create workflow',
              'Add data source',
              'Export results',
              'Schedule execution'
            ].map((command) => (
              <Button
                key={command}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => sendCommand(command)}
              >
                {command}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
