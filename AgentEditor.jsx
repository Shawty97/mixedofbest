import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, TestTube, Trash2 } from 'lucide-react';

const AgentEditor = ({ agentId, onBack }) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTrait, setNewTrait] = useState('');
  const [newCapability, setNewCapability] = useState('');
  const [newKnowledgeSource, setNewKnowledgeSource] = useState('');

  const predefinedTraits = [
    'helpful', 'patient', 'professional', 'creative', 'analytical', 
    'friendly', 'precise', 'empathetic', 'innovative', 'detail-oriented'
  ];

  const predefinedCapabilities = [
    'customer_support', 'data_analysis', 'creative_writing', 'multilingual',
    'sentiment_analysis', 'statistical_modeling', 'visualization', 'storytelling',
    'content_optimization', 'research', 'problem_solving', 'code_generation'
  ];

  const predefinedKnowledgeSources = [
    'company_policies', 'product_catalog', 'faq_database', 'statistical_methods',
    'writing_techniques', 'literary_styles', 'grammar_rules', 'best_practices',
    'industry_standards', 'technical_documentation'
  ];

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: agent.name,
          description: agent.description,
          configuration: agent.configuration,
          status: agent.status
        })
      });

      if (response.ok) {
        alert('Agent updated successfully!');
      } else {
        alert('Error updating agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Error updating agent');
    }
  };

  const testAgent = async () => {
    const testMessage = prompt('Enter a test message for the agent:');
    if (!testMessage) return;

    try {
      const response = await fetch(`/api/agents/${agentId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: testMessage
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Agent Response: ${result.agent_response}\n\nCapabilities Used: ${result.capabilities_used?.join(', ') || 'None'}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`);
      } else {
        alert('Error testing agent');
      }
    } catch (error) {
      console.error('Error testing agent:', error);
      alert('Error testing agent');
    }
  };

  const deleteAgent = async () => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Agent deleted successfully!');
        onBack();
      } else {
        alert('Error deleting agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error deleting agent');
    }
  };

  const addTrait = (trait) => {
    if (trait && !agent.configuration.personality_traits.includes(trait)) {
      setAgent(prev => ({
        ...prev,
        configuration: {
          ...prev.configuration,
          personality_traits: [...prev.configuration.personality_traits, trait]
        }
      }));
      setNewTrait('');
    }
  };

  const removeTrait = (trait) => {
    setAgent(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        personality_traits: prev.configuration.personality_traits.filter(t => t !== trait)
      }
    }));
  };

  const addCapability = (capability) => {
    if (capability && !agent.configuration.capabilities.includes(capability)) {
      setAgent(prev => ({
        ...prev,
        configuration: {
          ...prev.configuration,
          capabilities: [...prev.configuration.capabilities, capability]
        }
      }));
      setNewCapability('');
    }
  };

  const removeCapability = (capability) => {
    setAgent(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        capabilities: prev.configuration.capabilities.filter(c => c !== capability)
      }
    }));
  };

  const addKnowledgeSource = (source) => {
    if (source && !agent.configuration.knowledge_sources.includes(source)) {
      setAgent(prev => ({
        ...prev,
        configuration: {
          ...prev.configuration,
          knowledge_sources: [...prev.configuration.knowledge_sources, source]
        }
      }));
      setNewKnowledgeSource('');
    }
  };

  const removeKnowledgeSource = (source) => {
    setAgent(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        knowledge_sources: prev.configuration.knowledge_sources.filter(s => s !== source)
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Agent not found</p>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Agents</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Agent</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={deleteAgent}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={testAgent}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <TestTube className="w-4 h-4" />
              <span>Test</span>
            </button>
            <button
              onClick={updateAgent}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Agent Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => setAgent(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={agent.description}
                onChange={(e) => setAgent(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={agent.status}
                onChange={(e) => setAgent(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Personality Traits */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Personality Traits</h3>
          
          {/* Current Traits */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {agent.configuration.personality_traits?.map((trait, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {trait}
                  <button
                    onClick={() => removeTrait(trait)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Add New Trait */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newTrait}
              onChange={(e) => setNewTrait(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add custom trait"
              onKeyPress={(e) => e.key === 'Enter' && addTrait(newTrait)}
            />
            <button
              onClick={() => addTrait(newTrait)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {/* Predefined Traits */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedTraits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => addTrait(trait)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
                  disabled={agent.configuration.personality_traits?.includes(trait)}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Capabilities</h3>
          
          {/* Current Capabilities */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {agent.configuration.capabilities?.map((capability, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {capability}
                  <button
                    onClick={() => removeCapability(capability)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Add New Capability */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add custom capability"
              onKeyPress={(e) => e.key === 'Enter' && addCapability(newCapability)}
            />
            <button
              onClick={() => addCapability(newCapability)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>

          {/* Predefined Capabilities */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedCapabilities.map((capability) => (
                <button
                  key={capability}
                  onClick={() => addCapability(capability)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
                  disabled={agent.configuration.capabilities?.includes(capability)}
                >
                  {capability}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Sources */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Knowledge Sources</h3>
          
          {/* Current Knowledge Sources */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {agent.configuration.knowledge_sources?.map((source, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  {source}
                  <button
                    onClick={() => removeKnowledgeSource(source)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Add New Knowledge Source */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newKnowledgeSource}
              onChange={(e) => setNewKnowledgeSource(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add custom knowledge source"
              onKeyPress={(e) => e.key === 'Enter' && addKnowledgeSource(newKnowledgeSource)}
            />
            <button
              onClick={() => addKnowledgeSource(newKnowledgeSource)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Add
            </button>
          </div>

          {/* Predefined Knowledge Sources */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedKnowledgeSources.map((source) => (
                <button
                  key={source}
                  onClick={() => addKnowledgeSource(source)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
                  disabled={agent.configuration.knowledge_sources?.includes(source)}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Metadata */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <p className="text-gray-600">{new Date(agent.created_at).toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <p className="text-gray-600">{new Date(agent.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Creator:</span>
              <p className="text-gray-600">{agent.creator}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentEditor;

