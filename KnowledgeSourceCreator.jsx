import React, { useState } from 'react';
import { ArrowLeft, Save, Upload, Link as LinkIcon, FileText, Database, Settings, Play } from 'lucide-react';

const KnowledgeSourceCreator = ({ onBack }) => {
  const [source, setSource] = useState({
    name: '',
    type: 'text',
    path_or_url: '',
    metadata: {
      auto_chunk: true,
      chunk_size: 1000,
      overlap: 200,
      extract_metadata: true,
      language: 'auto'
    }
  });

  const [sourceType, setSourceType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const sourceTypes = [
    {
      id: 'text',
      label: 'Text Content',
      icon: FileText,
      description: 'Direct text input'
    },
    {
      id: 'url',
      label: 'Web URL',
      icon: LinkIcon,
      description: 'Extract content from website'
    },
    {
      id: 'file',
      label: 'File Upload',
      icon: Upload,
      description: 'Upload PDF, TXT, or DOC files'
    }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSource(prev => ({
        ...prev,
        name: prev.name || file.name.split('.')[0],
        path_or_url: file.name
      }));
    }
  };

  const saveKnowledgeSource = async () => {
    if (!source.name.trim()) {
      alert('Please enter a knowledge source name');
      return;
    }

    let contentData = '';
    
    switch (sourceType) {
      case 'text':
        if (!textContent.trim()) {
          alert('Please enter text content');
          return;
        }
        contentData = textContent;
        break;
      case 'url':
        if (!webUrl.trim()) {
          alert('Please enter a valid URL');
          return;
        }
        contentData = webUrl;
        break;
      case 'file':
        if (!selectedFile) {
          alert('Please select a file to upload');
          return;
        }
        contentData = selectedFile.name;
        break;
    }

    try {
      const response = await fetch('/api/knowledge-builder/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: source.name,
          type: sourceType,
          path_or_url: contentData,
          metadata: source.metadata
        })
      });

      if (response.ok) {
        alert('Knowledge source created successfully!');
        onBack();
      } else {
        alert('Error creating knowledge source');
      }
    } catch (error) {
      console.error('Error creating knowledge source:', error);
      alert('Error creating knowledge source');
    }
  };

  const processSource = async () => {
    if (!source.name.trim()) {
      alert('Please save the knowledge source first');
      return;
    }
    alert('Processing started! (Demo mode)');
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
              <span>Back to Knowledge Builder</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add Knowledge Source</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={processSource}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Play className="w-4 h-4" />
              <span>Process</span>
            </button>
            <button
              onClick={saveKnowledgeSource}
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
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Knowledge Source Name
                </label>
                <input
                  type="text"
                  value={source.name}
                  onChange={(e) => setSource(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a descriptive name for this knowledge source"
                />
              </div>
            </div>
          </div>

          {/* Source Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Source Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sourceTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSourceType(type.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      sourceType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-6 h-6 ${
                        sourceType === type.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Input */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Content</h2>
            
            {sourceType === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="10"
                  placeholder="Paste or type your text content here..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the text content that you want to add to the knowledge base.
                </p>
              </div>
            )}

            {sourceType === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/page"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the URL of the webpage you want to extract content from. The system will automatically crawl and extract the text content.
                </p>
              </div>
            )}

            {sourceType === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Upload
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Drop your file here, or{' '}
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.txt,.doc,.docx"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports PDF, TXT, DOC, DOCX files up to 10MB
                    </p>
                  </div>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Processing Options */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Processing Options</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto_chunk"
                  checked={source.metadata.auto_chunk}
                  onChange={(e) => setSource(prev => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      auto_chunk: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="auto_chunk" className="text-sm font-medium text-gray-700">
                  Automatically chunk content into smaller segments
                </label>
              </div>

              {source.metadata.auto_chunk && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chunk Size (characters)
                    </label>
                    <input
                      type="number"
                      value={source.metadata.chunk_size}
                      onChange={(e) => setSource(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          chunk_size: parseInt(e.target.value) || 1000
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="100"
                      max="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overlap (characters)
                    </label>
                    <input
                      type="number"
                      value={source.metadata.overlap}
                      onChange={(e) => setSource(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          overlap: parseInt(e.target.value) || 200
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="1000"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="extract_metadata"
                  checked={source.metadata.extract_metadata}
                  onChange={(e) => setSource(prev => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      extract_metadata: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="extract_metadata" className="text-sm font-medium text-gray-700">
                  Extract metadata (titles, headers, structure)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language Detection
                </label>
                <select
                  value={source.metadata.language}
                  onChange={(e) => setSource(prev => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      language: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          {(textContent || webUrl || selectedFile) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Name:</span>
                    <span>{source.name || 'Untitled'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{sourceType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Content:</span>
                    <span className="text-right max-w-xs truncate">
                      {sourceType === 'text' && textContent.substring(0, 50) + '...'}
                      {sourceType === 'url' && webUrl}
                      {sourceType === 'file' && selectedFile?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Auto-chunk:</span>
                    <span>{source.metadata.auto_chunk ? 'Yes' : 'No'}</span>
                  </div>
                  {source.metadata.auto_chunk && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Chunk size:</span>
                      <span>{source.metadata.chunk_size} chars</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeSourceCreator;

