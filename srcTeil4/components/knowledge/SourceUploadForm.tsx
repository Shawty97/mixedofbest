
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKnowledgeBuilder } from '@/hooks/use-knowledge-builder';
import { UploadCloud, Link as LinkIcon } from 'lucide-react';

export function SourceUploadForm() {
  const { addSource } = useKnowledgeBuilder();
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const handleAddUrl = () => {
    if (url.trim()) {
      addSource({ name: url.split('/')[2] || url, type: 'url', url });
      setUrl('');
    }
  };

  const handleAddFile = () => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        addSource({ name: file.name, type: 'file', content });
        setFiles([]);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="file">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Datei hochladen</TabsTrigger>
          <TabsTrigger value="url">URL hinzufügen</TabsTrigger>
        </TabsList>
        <TabsContent value="file" className="pt-6">
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-10 h-10 text-gray-500 mb-2" />
              {isDragActive ? (
                <p>Datei hier ablegen...</p>
              ) : (
                <p className="text-center text-sm text-gray-500">
                  Datei per Drag & Drop hier ablegen
                  <br />
                  oder klicken, um eine Datei auszuwählen
                </p>
              )}
            </div>
            {files.length > 0 && (
              <div className="text-center">
                <p>Ausgewählte Datei: <strong>{files[0].name}</strong></p>
              </div>
            )}
            <Button onClick={handleAddFile} disabled={files.length === 0} className="w-full">
              Datei verarbeiten
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="url" className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="url-input">Webseiten-URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://beispiel.com/artikel"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddUrl} disabled={!url.trim()} className="w-full">
              URL hinzufügen und verarbeiten
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
