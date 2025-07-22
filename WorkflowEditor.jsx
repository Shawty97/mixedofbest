import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Play, Trash2 } from 'lucide-react';

const WorkflowEditor = ({ workflowId, onBack }) => {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflow();
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflow(data);
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: workflow.name,
          description: workflow.description,
          dag_structure: workflow.dag_structure
        })
      });

      if (response.ok) {
        alert('Workflow updated successfully!');
      } else {
        alert('Error updating workflow');
      }
    } catch (error) {
      console.error('Error updating workflow:', error);
      alert('Error updating workflow');
    }
  };

  const executeWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input_data: { message: 'Test execution' }
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Workflow executed! Execution ID: ${result.execution_id}`);
      } else {
        alert('Error executing workflow');
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Error executing workflow');
    }
  };

  const deleteWorkflow = async () => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Workflow deleted successfully!');
        onBack();
      } else {
        alert('Error deleting workflow');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      alert('Error deleting workflow');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Workflow not found</p>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Workflow</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={deleteWorkflow}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={updateWorkflow}
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
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={workflow.status}
              onChange={(e) => setWorkflow(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Workflow Structure</h3>
          <div className="bg-gray-50 rounded-lg border p-4 min-h-96">
            {workflow.dag_structure && workflow.dag_structure.nodes ? (
              <div className="relative">
                {/* Render Nodes */}
                {workflow.dag_structure.nodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="absolute p-3 rounded-lg border-2 bg-blue-100 border-blue-300"
                    style={{
                      left: 100 + (index * 200),
                      top: 100,
                      minWidth: '150px'
                    }}
                  >
                    <div className="text-sm font-medium">{node.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{node.type}</div>
                  </div>
                ))}

                {/* Render Edges */}
                <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                  {workflow.dag_structure.edges && workflow.dag_structure.edges.map((edge, index) => {
                    const sourceIndex = workflow.dag_structure.nodes.findIndex(n => n.id === edge.source);
                    const targetIndex = workflow.dag_structure.nodes.findIndex(n => n.id === edge.target);
                    
                    if (sourceIndex === -1 || targetIndex === -1) return null;

                    const x1 = 175 + (sourceIndex * 200);
                    const y1 = 125;
                    const x2 = 175 + (targetIndex * 200);
                    const y2 = 125;

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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No workflow structure defined</p>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Metadata */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <p className="text-gray-600">{new Date(workflow.created_at).toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <p className="text-gray-600">{new Date(workflow.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Creator:</span>
              <p className="text-gray-600">{workflow.creator}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditor;

