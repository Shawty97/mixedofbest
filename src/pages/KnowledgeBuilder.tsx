import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Database, Search } from 'lucide-react';

const KnowledgeBuilder: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Knowledge Builder</h1>
        <p className="text-muted-foreground">
          Build intelligent knowledge bases for your AI agents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>
              Add documents to knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Upload</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Vector Database
            </CardTitle>
            <CardDescription>
              Manage semantic search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Manage</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Test
            </CardTitle>
            <CardDescription>
              Test knowledge retrieval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Test</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeBuilder;