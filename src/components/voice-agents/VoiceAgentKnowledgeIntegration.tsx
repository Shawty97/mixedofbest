import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VoiceAgent } from '@/types/voice-agent.types';
import { Database, FileText, Globe, FileUp, Trash2, UploadCloud, Search, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface VoiceAgentKnowledgeIntegrationProps {
  agent: VoiceAgent;
  onKnowledgeSourcesChange: (sources: string[]) => void;
  onVectorDatabaseChange?: (enabled: boolean) => void;
}

// Mock knowledge source interface
interface KnowledgeSource {
  id: string;
  name: string;
  type: 'file' | 'text' | 'url';
  size?: number;
  vectorized?: boolean;
  lastUpdated?: Date;
  status: 'processed' | 'processing' | 'failed';
  metadata?: Record<string, any>;
}

export function VoiceAgentKnowledgeIntegration({ 
  agent, 
  onKnowledgeSourcesChange,
  onVectorDatabaseChange
}: VoiceAgentKnowledgeIntegrationProps) {
  const [activeTab, setActiveTab] = useState('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [vectorEnabled, setVectorEnabled] = useState(true);
  const [selectedSources, setSelectedSources] = useState<string[]>(agent.knowledgeSources || []);
  const [availableSources, setAvailableSources] = useState<KnowledgeSource[]>([]);
  
  const { toast } = useToast();

  // Mock data for available knowledge sources
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    const mockSources: KnowledgeSource[] = [
      {
        id: 'ks-1',
        name: 'Company Handbook',
        type: 'file',
        size: 1250000,
        vectorized: true,
        lastUpdated: new Date('2024-07-15'),
        status: 'processed',
        metadata: { pages: 48, language: 'en' }
      },
      {
        id: 'ks-2',
        name: 'Product Documentation',
        type: 'url',
        vectorized: true,
        lastUpdated: new Date('2024-07-10'),
        status: 'processed',
        metadata: { url: 'https://docs.example.com/product', chunks: 35 }
      },
      {
        id: 'ks-3',
        name: 'Customer Support Guidelines',
        type: 'text',
        size: 45000,
        vectorized: true,
        lastUpdated: new Date('2024-07-18'),
        status: 'processed',
        metadata: { words: 3500, language: 'en' }
      },
      {
        id: 'ks-4',
        name: 'API Documentation',
        type: 'url',
        vectorized: false,
        lastUpdated: new Date('2024-07-05'),
        status: 'processing',
        metadata: { url: 'https://api.example.com/docs' }
      }
    ];
    
    setAvailableSources(mockSources);
  }, []);

  // Filter sources based on search query
  const filteredSources = availableSources.filter(source => 
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add mock knowledge source
          const newSource: KnowledgeSource = {
            id: `ks-${Date.now()}`,
            name: files[0].name,
            type: 'file',
            size: files[0].size,
            vectorized: vectorEnabled,
            lastUpdated: new Date(),
            status: 'processing',
            metadata: { type: files[0].type }
          };
          
          setAvailableSources(prev => [...prev, newSource]);
          
          // Simulate processing
          setIsProcessing(true);
          setTimeout(() => {
            setAvailableSources(prev => 
              prev.map(s => s.id === newSource.id ? { ...s, status: 'processed' } : s)
            );
            setIsProcessing(false);
            
            toast({
              title: "Upload complete",
              description: `${files[0].name} has been processed and vectorized.`,
            });
          }, 3000);
          
          return 0;
        }
        return prev + 5;
      });
    }, 200);

    // Reset file input
    e.target.value = '';
  };

  // Handle URL submission
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    // Validate URL
    try {
      new URL(urlInput);
    } catch (err) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Add mock knowledge source
    const newSource: KnowledgeSource = {
      id: `ks-${Date.now()}`,
      name: urlInput.split('/').pop() || 'Web Content',
      type: 'url',
      vectorized: vectorEnabled,
      lastUpdated: new Date(),
      status: 'processing',
      metadata: { url: urlInput }
    };
    
    setAvailableSources(prev => [...prev, newSource]);
    
    // Simulate processing
    setTimeout(() => {
      setAvailableSources(prev => 
        prev.map(s => s.id === newSource.id ? { ...s, status: 'processed' } : s)
      );
      setIsProcessing(false);
      setUrlInput('');
      
      toast({
        title: "URL processed",
        description: `Web content has been processed and vectorized.`,
      });
    }, 2500);
  };

  // Handle text submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput) return;

    setIsProcessing(true);
    
    // Add mock knowledge source
    const newSource: KnowledgeSource = {
      id: `ks-${Date.now()}`,
      name: `Text Content ${new Date().toLocaleDateString()}`,
      type: 'text',
      size: textInput.length,
      vectorized: vectorEnabled,
      lastUpdated: new Date(),
      status: 'processing',
      metadata: { words: textInput.split(/\s+/).length }
    };
    
    setAvailableSources(prev => [...prev, newSource]);
    
    // Simulate processing
    setTimeout(() => {
      setAvailableSources(prev => 
        prev.map(s => s.id === newSource.id ? { ...s, status: 'processed' } : s)
      );
      setIsProcessing(false);
      setTextInput('');
      
      toast({
        title: "Text processed",
        description: `Text content has been processed and vectorized.`,
      });
    }, 1500);
  };

  // Toggle source selection
  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSources(prev => {
      const newSelection = prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId];
      
      // Notify parent component
      onKnowledgeSourcesChange(newSelection);
      return newSelection;
    });
  };

  // Handle vector database toggle
  const handleVectorToggle = (enabled: boolean) => {
    setVectorEnabled(enabled);
    onVectorDatabaseChange?.(enabled);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5" />
          Knowledge Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vector DB Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium">Vector Database</h3>
              <p className="text-xs text-muted-foreground">Enable semantic search capability</p>
            </div>
          </div>
          <Switch 
            checked={vectorEnabled} 
            onCheckedChange={handleVectorToggle} 
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge sources..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Sources</TabsTrigger>
            <TabsTrigger value="add">Add New Source</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="space-y-4 pt-4">
            {filteredSources.length > 0 ? (
              <div className="space-y-2">
                {filteredSources.map(source => (
                  <div 
                    key={source.id} 
                    className={`
                      flex items-center justify-between p-3 rounded-md border
                      ${selectedSources.includes(source.id) ? 'border-primary bg-primary/5' : ''}
                      ${source.status === 'processing' ? 'opacity-70' : ''}
                      cursor-pointer
                    `}
                    onClick={() => source.status === 'processed' && toggleSourceSelection(source.id)}
                  >
                    <div className="flex items-center gap-3">
                      {source.type === 'file' && <FileText className="h-5 w-5 text-blue-500" />}
                      {source.type === 'url' && <Globe className="h-5 w-5 text-green-500" />}
                      {source.type === 'text' && <FileText className="h-5 w-5 text-orange-500" />}
                      <div>
                        <h3 className="text-sm font-medium">{source.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {source.lastUpdated?.toLocaleDateString()}
                          </span>
                          {source.size && (
                            <span className="text-xs text-muted-foreground">
                              {(source.size / 1024).toFixed(0)} KB
                            </span>
                          )}
                          {source.status === 'processing' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">Processing</Badge>
                          )}
                          {source.vectorized && source.status === 'processed' && (
                            <Badge variant="outline" className="bg-quantum-50 text-quantum-700">Vectorized</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {selectedSources.includes(source.id) && (
                        <Badge className="mr-2">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-dashed border-2 rounded-lg">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No knowledge sources found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="add" className="space-y-6 pt-4">
            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Upload File
              </h3>
              
              <div 
                className="border-dashed border-2 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, CSV (max 10MB)</p>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.txt,.csv"
                  onChange={handleFileUpload}
                />
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
            
            {/* URL Import */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Import from URL
              </h3>
              
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <Input 
                  placeholder="https://example.com/document" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isProcessing}
                />
                <Button type="submit" disabled={!urlInput || isProcessing}>
                  Import
                </Button>
              </form>
            </div>
            
            {/* Text Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Text Content
              </h3>
              
              <form onSubmit={handleTextSubmit} className="space-y-2">
                <textarea 
                  className="w-full min-h-[120px] p-3 rounded-md border resize-y"
                  placeholder="Paste or type text content here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isProcessing}
                />
                <Button type="submit" className="w-full" disabled={!textInput || isProcessing}>
                  Process Text
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="space-y-2 border rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Processing knowledge source...</span>
              <span className="text-xs text-muted-foreground">This may take a moment</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}
        
        {/* Selected sources summary */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Selected Knowledge Sources ({selectedSources.length})</h3>
          
          {selectedSources.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedSources.map(id => {
                const source = availableSources.find(s => s.id === id);
                return source ? (
                  <Badge 
                    key={id} 
                    variant="outline"
                    className="pl-2 flex items-center gap-1"
                  >
                    {source.name}
                    <button 
                      className="ml-1 h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center"
                      onClick={() => toggleSourceSelection(id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No knowledge sources selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}