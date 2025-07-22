
import { NodeCard } from "./NodeCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function WorkflowBuilder() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Workflow Builder</h2>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Node
        </Button>
      </div>
      
      <div className="grid gap-6">
        <div className="flex items-center gap-6">
          <NodeCard
            title="Initial Prompt"
            type="prompt"
            description="Define the initial task or query for the AI workflow"
          />
          <NodeCard
            title="Language Model"
            type="agent"
            description="Process and analyze the input using GPT-4"
          />
          <NodeCard
            title="Response Generator"
            type="output"
            description="Format and structure the final output"
          />
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium mb-2">Workflow Preview</h3>
          <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
{`{
  "workflow": {
    "nodes": [
      { "id": "prompt-1", "type": "prompt" },
      { "id": "agent-1", "type": "agent" },
      { "id": "output-1", "type": "output" }
    ],
    "edges": [
      { "from": "prompt-1", "to": "agent-1" },
      { "from": "agent-1", "to": "output-1" }
    ]
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
