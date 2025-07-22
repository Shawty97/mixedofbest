
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Database, Cpu, FileOutput, Mic } from "lucide-react";
import { CustomNode } from "./types/workflow.types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNode: (type: string, position: { x: number; y: number }) => string;
}

export function Sidebar({ isOpen, onClose, onCreateNode }: SidebarProps) {
  const nodeTypes = [
    { type: 'input', label: 'Input Node', icon: Database, description: 'Start your workflow with input data' },
    { type: 'aiModel', label: 'AI Model', icon: Cpu, description: 'Process data with AI models' },
    { type: 'processing', label: 'Processing', icon: Cpu, description: 'Transform and process data' },
    { type: 'output', label: 'Output', icon: FileOutput, description: 'Final output of your workflow' },
    { type: 'voiceToAgent', label: 'Voice Agent', icon: Mic, description: 'Voice-to-agent processing' }
  ];

  const handleCreateNode = (type: string) => {
    const position = { x: Math.random() * 300, y: Math.random() * 300 };
    onCreateNode(type, position);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Nodes</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <Button
              key={nodeType.type}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => handleCreateNode(nodeType.type)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{nodeType.label}</div>
                  <div className="text-xs text-gray-500">{nodeType.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
