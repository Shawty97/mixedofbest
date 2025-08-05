import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Database, Search, FileText, Trash2, Loader2 } from 'lucide-react';
import { knowledgeAPI } from '@/services/knowledgeService';

const KnowledgeBuilder: React.FC = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newDocument, setNewDocument] = useState({ title: '', content: '' });

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await knowledgeAPI.getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.title.trim() || !newDocument.content.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await knowledgeAPI.embed({
        text: newDocument.content,
        title: newDocument.title,
        metadata: { source: 'manual_upload' }
      });

      toast({
        title: "Success",
        description: "Document added to knowledge base",
      });

      setNewDocument({ title: '', content: '' });
      loadDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await knowledgeAPI.search({
        query: searchQuery,
        limit: 5,
        threshold: 0.7
      });
      setSearchResults(results.matches || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await knowledgeAPI.deleteDocument(documentId);
      toast({
        title: "Success",
        description: "Document deleted",
      });
      loadDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Knowledge Builder</h1>
        <p className="text-muted-foreground">
          Build intelligent knowledge bases for your AI agents with vector embeddings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Add Document
            </CardTitle>
            <CardDescription>
              Add text content to your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Document title"
              value={newDocument.title}
              onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Document content"
              value={newDocument.content}
              onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <Button 
              className="w-full" 
              onClick={handleAddDocument}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Add to Knowledge Base'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Search & Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Knowledge
            </CardTitle>
            <CardDescription>
              Test semantic search across your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter search query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm">{result.document_title}</p>
                      <Badge variant="secondary">{(result.similarity * 100).toFixed(1)}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Knowledge Documents
          </CardTitle>
          <CardDescription>
            Manage your uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No documents uploaded yet. Add your first document above.
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.status === 'completed' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBuilder;