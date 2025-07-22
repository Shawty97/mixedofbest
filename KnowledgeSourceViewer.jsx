import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Play, Trash2, RefreshCw } from 'lucide-react';

const KnowledgeSourceViewer = ({ sourceId, onBack }) => {
  const [source, setSource] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSource();
    fetchDocuments();
  }, [sourceId]);

  const fetchSource = async () => {
    try {
      const response = await fetch(`/api/knowledge-builder/sources/${sourceId}`);
      if (response.ok) {
        const data = await response.json();
        setSource(data);
      }
    } catch (error) {
      console.error('Error fetching knowledge source:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/knowledge-builder/sources/${sourceId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const processSource = async () => {
    try {
      const response = await fetch(`/api/knowledge-builder/sources/${sourceId}/process`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Processing started! This may take a few minutes.');
        // Update source status
        setSource(prev => ({ ...prev, processing_status: 'processing' }));
      } else {
        alert('Error starting processing');
      }
    } catch (error) {
      console.error('Error processing source:', error);
      alert('Error processing source');
    }
  };

  const deleteSource = async () => {
    if (!confirm('Are you sure you want to delete this knowledge source?')) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge-builder/sources/${sourceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Knowledge source deleted successfully!');
        onBack();
      } else {
        alert('Error deleting knowledge source');
      }
    } catch (error) {
      console.error('Error deleting knowledge source:', error);
      alert('Error deleting knowledge source');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge source...</p>
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Knowledge source not found</p>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Knowledge Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Source Details</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={deleteSource}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            {source.processing_status === 'pending' && (
              <button
                onClick={processSource}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                <span>Process</span>
              </button>
            )}
            {source.processing_status === 'failed' && (
              <button
                onClick={processSource}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>

        {/* Source Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{source.name}</h3>
              <p className="text-gray-600 mt-1">Type: {source.type}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(source.processing_status)}`}>
              {source.processing_status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Source Content</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {source.type === 'text' ? (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {source.path_or_url.length > 500 
                      ? source.path_or_url.substring(0, 500) + '...' 
                      : source.path_or_url
                    }
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">{source.path_or_url}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="text-gray-600 ml-2">{new Date(source.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated:</span>
                  <span className="text-gray-600 ml-2">{new Date(source.updated_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Documents:</span>
                  <span className="text-gray-600 ml-2">{documents.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {source.processing_status === 'processing' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Processing in Progress</h4>
                <p className="text-sm text-yellow-700">
                  The knowledge source is being processed. This may take a few minutes depending on the content size.
                </p>
              </div>
            </div>
          </div>
        )}

        {source.processing_status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-red-800">Processing Failed</h4>
            <p className="text-sm text-red-700">
              There was an error processing this knowledge source. Please check the content and try again.
            </p>
          </div>
        )}

        {/* Extracted Documents */}
        {documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Extracted Documents ({documents.length})</h3>
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={doc.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
                    <span className="text-xs text-gray-500">
                      {doc.metadata?.word_count ? `${doc.metadata.word_count} words` : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {doc.content.length > 200 
                      ? doc.content.substring(0, 200) + '...' 
                      : doc.content
                    }
                  </p>
                  {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Metadata: {JSON.stringify(doc.metadata)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Documents */}
        {source.processing_status === 'completed' && documents.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-gray-600">
              The knowledge source was processed but no documents were extracted. 
              This might indicate an issue with the content format.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeSourceViewer;

