import React, { useState } from 'react';
import { ArrowLeft, Save, TestTube, Plus, X, Bot, Brain, Database, Settings } from 'lucide-react';

const AgentCreator = ({ onBack }) => {
  const [agent, setAgent] = useState({
    name: '',
    description: '',
    voice: 'en-US-Standard-A',
    language: 'en',
    instructions: '',
    configuration: {
      personality_traits: [],
      capabilities: [],
      knowledge_sources: [],
      tools: [],
      call_handling: {
        end_call_timeout: 60,
        fallback_behavior: 'transfer_to_human'
      }
    }
  });

  const [newTrait, setNewTrait] = useState('');
  const [newCapability, setNewCapability] = useState('');
  const [newKnowledgeSource, setNewKnowledgeSource] = useState('');
  const [newTool, setNewTool] = useState('');

  const predefinedTraits = [
    'helpful', 'patient', 'professional', 'creative', 'analytical', 
    'friendly', 'precise', 'empathetic', 'innovative', 'detail-oriented',
    'enthusiastic', 'calm', 'supportive', 'efficient', 'thorough'
  ];

  const predefinedCapabilities = [
    'customer_support', 'data_analysis', 'creative_writing', 'multilingual',
    'sentiment_analysis', 'statistical_modeling', 'visualization', 'storytelling',
    'content_optimization', 'research', 'problem_solving', 'code_generation',
    'appointment_scheduling', 'lead_qualification', 'order_processing', 'technical_support'
  ];

  const predefinedKnowledgeSources = [
    'company_policies', 'product_catalog', 'faq_database', 'statistical_methods',
    'writing_techniques', 'literary_styles', 'grammar_rules', 'best_practices',
    'industry_standards', 'technical_documentation', 'training_materials', 'user_manuals'
  ];

  const predefinedTools = [
    'calendar_integration', 'crm_access', 'email_sending', 'sms_sending',
    'webhook_calls', 'database_queries', 'file_uploads', 'payment_processing',
    'inventory_check', 'order_tracking', 'knowledge_search', 'translation'
  ];

  const voiceOptions = [
    { value: 'en-US-Standard-A', label: 'English (US) - Female' },
    { value: 'en-US-Standard-B', label: 'English (US) - Male' },
    { value: 'en-GB-Standard-A', label: 'English (UK) - Female' },
    { value: 'de-DE-Standard-A', label: 'German - Female' },
    { value: 'de-DE-Standard-B', label: 'German - Male' },
    { value: 'fr-FR-Standard-A', label: 'French - Female' },
    { value: 'es-ES-Standard-A', label: 'Spanish - Female' }
  ];

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

  const addTool = (tool) => {
    if (tool && !agent.configuration.tools.includes(tool)) {
      setAgent(prev => ({
        ...prev,
        configuration: {
          ...prev.configuration,
          tools: [...prev.configuration.tools, tool]
        }
      }));
      setNewTool('');
    }
  };

  const removeTool = (tool) => {
    setAgent(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        tools: prev.configuration.tools.filter(t => t !== tool)
      }
    }));
  };

  const saveAgent = async () => {
    if (!agent.name.trim()) {
      alert('Please enter an agent name');
      return;
    }

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: agent.name,
          description: agent.description,
          voice: agent.voice,
          language: agent.language,
          instructions: agent.instructions,
          configuration: agent.configuration
        })
      });

      if (response.ok) {
        alert('Agent saved successfully!');
        onBack();
      } else {
        alert('Error saving agent');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Error saving agent');
    }
  };

  const testAgent = () => {
    if (!agent.name.trim()) {
      alert('Please enter an agent name before testing');
      return;
    }
    alert('Agent test started! (Demo mode)');
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Create Agent</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={testAgent}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <TestTube className="w-4 h-4" />
              <span>Test</span>
            </button>
            <button
              onClick={saveAgent}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bot className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => setAgent(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter agent name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <select
                  value={agent.voice}
                  onChange={(e) => setAgent(prev => ({ ...prev, voice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {voiceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={agent.description}
                  onChange={(e) => setAgent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe what this agent does"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions / Persona
                </label>
                <textarea
                  value={agent.instructions}
                  onChange={(e) => setAgent(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter detailed instructions for the agent's behavior and personality"
                />
              </div>
            </div>
          </div>

          {/* Personality Traits */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Personality Traits</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {agent.configuration.personality_traits.map(trait => (
                  <span
                    key={trait}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    {trait}
                    <button
                      onClick={() => removeTrait(trait)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {predefinedTraits.map(trait => (
                  <button
                    key={trait}
                    onClick={() => addTrait(trait)}
                    className="px-3 py-1 text-sm border border-purple-300 text-purple-700 rounded-full hover:bg-purple-50"
                    disabled={agent.configuration.personality_traits.includes(trait)}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Capabilities</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {agent.configuration.capabilities.map(capability => (
                  <span
                    key={capability}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {capability}
                    <button
                      onClick={() => removeCapability(capability)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
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
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {predefinedCapabilities.map(capability => (
                  <button
                    key={capability}
                    onClick={() => addCapability(capability)}
                    className="px-3 py-1 text-sm border border-green-300 text-green-700 rounded-full hover:bg-green-50"
                    disabled={agent.configuration.capabilities.includes(capability)}
                  >
                    {capability}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Knowledge Sources */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Knowledge Sources</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {agent.configuration.knowledge_sources.map(source => (
                  <span
                    key={source}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {source}
                    <button
                      onClick={() => removeKnowledgeSource(source)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {predefinedKnowledgeSources.map(source => (
                  <button
                    key={source}
                    onClick={() => addKnowledgeSource(source)}
                    className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded-full hover:bg-blue-50"
                    disabled={agent.configuration.knowledge_sources.includes(source)}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold">Tools & Integrations</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {agent.configuration.tools.map(tool => (
                  <span
                    key={tool}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                  >
                    {tool}
                    <button
                      onClick={() => removeTool(tool)}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add custom tool"
                  onKeyPress={(e) => e.key === 'Enter' && addTool(newTool)}
                />
                <button
                  onClick={() => addTool(newTool)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {predefinedTools.map(tool => (
                  <button
                    key={tool}
                    onClick={() => addTool(tool)}
                    className="px-3 py-1 text-sm border border-orange-300 text-orange-700 rounded-full hover:bg-orange-50"
                    disabled={agent.configuration.tools.includes(tool)}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Call Handling Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Call Handling Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Call Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={agent.configuration.call_handling.end_call_timeout}
                  onChange={(e) => setAgent(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      call_handling: {
                        ...prev.configuration.call_handling,
                        end_call_timeout: parseInt(e.target.value) || 60
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fallback Behavior
                </label>
                <select
                  value={agent.configuration.call_handling.fallback_behavior}
                  onChange={(e) => setAgent(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      call_handling: {
                        ...prev.configuration.call_handling,
                        fallback_behavior: e.target.value
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="transfer_to_human">Transfer to Human</option>
                  <option value="end_call">End Call</option>
                  <option value="take_message">Take Message</option>
                  <option value="schedule_callback">Schedule Callback</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCreator;

