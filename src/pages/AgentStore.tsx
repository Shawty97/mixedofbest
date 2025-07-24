import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Download, Star, Search } from 'lucide-react';

const AgentStore: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agent Store</h1>
        <p className="text-muted-foreground">
          Discover and share AI agents with the community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Marketplace
            </CardTitle>
            <CardDescription>
              Browse available agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Explore</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              My Downloads
            </CardTitle>
            <CardDescription>
              Your installed agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Popular
            </CardTitle>
            <CardDescription>
              Trending agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Browse</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentStore;