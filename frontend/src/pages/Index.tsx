import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">AImpact Platform</h1>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Enterprise Voice Agent Ecosystem
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Build, deploy, and manage intelligent voice agents with enterprise-grade capabilities. 
          Create sophisticated conversational AI that scales with your business.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <Link to="/auth">Start Building</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/">View Demo</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;