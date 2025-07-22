import React, { useState } from 'react';
import { ArrowLeft, Plus, Save, Play, X, Trash2 } from 'lucide-react';

const WorkflowCreator = ({ onBack }) => {
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    nodes: [],
    edges: []
  });

  const [selectedNodeType, setSelectedNodeType] = useState('input');
  const [showNodeSelector, setShowNodeSelector] = useState(false);

  const nodeTypes = [
    { id: 'input', label: 'Input', color: 'bg-blue-100 border-blue-300', description: 'Receives input data' },
    { id: 'llm_call', label: 'LLM Call', color: 'bg-green-100 border-green-300', description: 'Processes with AI model' },
    { id: 'data_processing', label: 'Data Processing', color: 'bg-yellow-100 border-yellow-300', description: 'Transforms data' },
    { id: 'output', label: 'Output', color: 'bg-purple-100 border-purple-300', description: 'Returns final result' },
    { id: 'webhook', label: 'Webhook', color: 'bg-red-100 border-red-300', description: 'Calls external service' },
    { id: 'condition', label: 'Condition', color: 'bg-orange-100 border-orange-300', description: 'Conditional logic' }
  ];

  const addNode = (nodeType) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      label: `${nodeTypes.find(t => t.id === nodeType)?.label} ${workflow.nodes.length + 1}`,
      x: 100 + (workflow.nodes.length * 150),
      y: 100,
      config: {}
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setShowNodeSelector(false);
  };

  const removeNode = (nodeId) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    }));
  };

  const connectNodes = (sourceId, targetId) => {
    const edgeExists = workflow.edges.some(e => 
      e.source === sourceId && e.target === targetId
    );
    
    if (!edgeExists && sourceId !== targetId) {
      setWorkflow(prev => ({
        ...prev,
        edges: [...prev.edges, { source: sourceId, target: targetId }]
      }));
    }
  };

  const saveWorkflow = async () => {
    if (!workflow.name.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: workflow.name,
          description: workflow.description,
          dag_structure: {
            nodes: workflow.nodes,
            edges: workflow.edges
          }
        })
      });

      if (response.ok) {
        alert('Workflow saved successfully!');
        onBack();
      } else {
        alert('Error saving workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow');
    }
  };

  const executeWorkflow = () => {
    if (workflow.nodes.length === 0) {
      alert('Please add at least one node to execute the workflow');
      return;
    }
    alert('Workflow execution started! (Demo mode)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Workflows</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create Workflow</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={saveWorkflow}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={executeWorkflow}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Play className="w-4 h-4" />
              <span>Execute</span>
            </button>
          </div>
        </div>

        {/* Workflow Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workflow Name
              </label>
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter workflow description"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Node Palette */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-4">Node Types</h3>
            <div className="space-y-2">
              {nodeTypes.map(nodeType => (
                <div key={nodeType.id} className="space-y-2">
                  <button
                    onClick={() => setSelectedNodeType(nodeType.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedNodeType === nodeType.id 
                        ? nodeType.color + ' border-current' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {nodeType.label}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => addNode(selectedNodeType)}
              className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Node</span>
            </button>
          </div>

          {/* Workflow Canvas */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-4">Workflow Canvas</h3>
            <div className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-96 p-4">
              {workflow.nodes.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">No nodes added yet</p>
                    <p className="text-sm">Select a node type and click "Add Node" to get started</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Render Nodes */}
                  {workflow.nodes.map((node, index) => {
                    const nodeType = nodeTypes.find(t => t.id === node.type);
                    return (
                      <div
                        key={node.id}
                        className={`absolute p-3 rounded-lg border-2 cursor-pointer ${nodeType?.color || 'bg-gray-100 border-gray-300'}`}
                        style={{
                          left: node.x,
                          top: node.y,
                          minWidth: '120px'
                        }}
                      >
                        <div className="text-sm font-medium">{node.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{nodeType?.label}</div>
                        <button
                          onClick={() => removeNode(node.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                  {/* Render Edges */}
                  <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                    {workflow.edges.map((edge, index) => {
                      const sourceNode = workflow.nodes.find(n => n.id === edge.source);
                      const targetNode = workflow.nodes.find(n => n.id === edge.target);
                      
                      if (!sourceNode || !targetNode) return null;

                      const x1 = sourceNode.x + 60;
                      const y1 = sourceNode.y + 25;
                      const x2 = targetNode.x + 60;
                      const y2 = targetNode.y + 25;

                      return (
                        <line
                          key={index}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#6B7280"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      );
                    })}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#6B7280"
                        />
                      </marker>
                    </defs>
                  </svg>
                </div>
              )}
            </div>

            {/* Connection Helper */}
            {workflow.nodes.length > 1 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Connect Nodes</h4>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="px-2 py-1 border border-blue-300 rounded text-sm"
                    onChange={(e) => {
                      const sourceId = e.target.value;
                      const targetSelect = e.target.parentElement.querySelector('select:last-child');
                      if (targetSelect.value && sourceId !== targetSelect.value) {
                        connectNodes(sourceId, targetSelect.value);
                      }
                    }}
                  >
                    <option value="">Select source node</option>
                    {workflow.nodes.map(node => (
                      <option key={node.id} value={node.id}>{node.label}</option>
                    ))}
                  </select>
                  <select 
                    className="px-2 py-1 border border-blue-300 rounded text-sm"
                    onChange={(e) => {
                      const targetId = e.target.value;
                      const sourceSelect = e.target.parentElement.querySelector('select:first-child');
                      if (sourceSelect.value && targetId !== sourceSelect.value) {
                        connectNodes(sourceSelect.value, targetId);
                      }
                    }}
                  >
                    <option value="">Select target node</option>
                    {workflow.nodes.map(node => (
                      <option key={node.id} value={node.id}>{node.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCreator;

