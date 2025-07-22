import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Download, Heart, Search, Filter, Grid, List } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { PublishedAgent, AgentSearchFilters } from './types/agent-store.types';
import { AgentCard } from './AgentCard';
import { AgentCategoryFilter } from './AgentCategoryFilter';

export function AgentMarketplace() {
  const [agents, setAgents] = useState<PublishedAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<PublishedAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AgentSearchFilters>({
    category: 'all',
    priceType: 'all',
    rating: 0,
    sortBy: 'popular'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { user } = useAuth();

  useEffect(() => {
    loadAgents();
    if (user) {
      loadUserFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterAgents();
  }, [agents, filters, searchQuery]);

  const loadAgents = async () => {
    try {
      // Use type assertion to bypass strict typing for new tables
      const { data, error } = await (supabase as any).rpc('get_published_agents', {
        sort_by: filters.sortBy || 'popular'
      });

      if (error) {
        console.error('Error loading agents:', error);
        // Load demo data as fallback
        setAgents(getDemoAgents());
      } else {
        setAgents((data as PublishedAgent[]) || getDemoAgents());
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      setAgents(getDemoAgents());
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    try {
      // Use type assertion for new table
      const { data, error } = await (supabase as any).rpc('get_user_favorites', {
        user_id: user?.id
      });

      if (error) {
        console.error('Error loading favorites:', error);
        return;
      }

      const favIds = new Set<string>(data?.map((fav: any) => fav.agent_id) || []);
      setFavorites(favIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterAgents = () => {
    let filtered = [...agents];

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(agent => agent.category === filters.category);
    }

    // Price filter
    if (filters.priceType && filters.priceType !== 'all') {
      if (filters.priceType === 'free') {
        filtered = filtered.filter(agent => agent.price_type === 'free');
      } else if (filters.priceType === 'paid') {
        filtered = filtered.filter(agent => agent.price_type !== 'free');
      }
    }

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(agent => agent.rating_average >= filters.rating);
    }

    setFilteredAgents(filtered);
  };

  const toggleFavorite = async (agentId: string) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um Favoriten zu verwalten.",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.has(agentId);

    try {
      if (isFavorite) {
        // Use type assertion for new table operation
        const { error } = await (supabase as any).rpc('remove_agent_favorite', {
          p_agent_id: agentId,
          p_user_id: user.id
        });

        if (error) throw error;

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(agentId);
          return newSet;
        });
      } else {
        const { error } = await (supabase as any).rpc('add_agent_favorite', {
          p_agent_id: agentId,
          p_user_id: user.id
        });

        if (error) throw error;

        setFavorites(prev => new Set([...prev, agentId]));
      }

      toast({
        title: isFavorite ? "Aus Favoriten entfernt" : "Zu Favoriten hinzugefügt",
        description: isFavorite ? "Agent wurde aus Ihren Favoriten entfernt." : "Agent wurde zu Ihren Favoriten hinzugefügt.",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Fehler",
        description: "Favorit konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const downloadAgent = async (agent: PublishedAgent) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um Agenten herunterzuladen.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Record download using RPC function
      const { error } = await (supabase as any).rpc('download_agent', {
        p_agent_id: agent.id,
        p_user_id: user.id,
        p_download_type: agent.price_type === 'free' ? 'free' : 'purchased'
      });

      if (error) throw error;

      // In a real implementation, you would import the workflow here
      console.log('Downloading agent workflow:', agent.workflow_definition);

      toast({
        title: "Download erfolgreich",
        description: `Agent "${agent.name}" wurde zu Ihrer Bibliothek hinzugefügt.`,
      });
    } catch (error) {
      console.error('Error downloading agent:', error);
      toast({
        title: "Download fehlgeschlagen",
        description: "Agent konnte nicht heruntergeladen werden.",
        variant: "destructive"
      });
    }
  };

  const getDemoAgents = (): PublishedAgent[] => [
    {
      id: 'demo-1',
      name: 'Email Marketing Assistant',
      description: 'Automatisiert E-Mail-Kampagnen und generiert personalisierte Inhalte',
      category: 'business',
      author_id: 'demo-author-1',
      workflow_definition: { nodes: [], edges: [] },
      price_type: 'free',
      downloads_count: 1250,
      rating_average: 4.8,
      rating_count: 89,
      is_featured: true,
      is_approved: true,
      tags: ['email', 'marketing', 'automation'],
      preview_images: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        id: 'demo-author-1',
        email: 'author1@example.com',
        full_name: 'John Developer'
      }
    },
    {
      id: 'demo-2',
      name: 'Content Creator Pro',
      description: 'Erstellt Blogs, Social Media Posts und Werbetexte',
      category: 'creative',
      author_id: 'demo-author-2',
      workflow_definition: { nodes: [], edges: [] },
      price_type: 'one_time',
      price_amount: 29.99,
      downloads_count: 890,
      rating_average: 4.6,
      rating_count: 67,
      is_featured: false,
      is_approved: true,
      tags: ['content', 'writing', 'social-media'],
      preview_images: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        id: 'demo-author-2',
        email: 'author2@example.com',
        full_name: 'Jane Writer'
      }
    },
    {
      id: 'demo-3',
      name: 'Code Review Assistant',
      description: 'Analysiert Code und gibt Verbesserungsvorschläge',
      category: 'technical',
      author_id: 'demo-author-3',
      workflow_definition: { nodes: [], edges: [] },
      price_type: 'free',
      downloads_count: 567,
      rating_average: 4.9,
      rating_count: 34,
      is_featured: false,
      is_approved: true,
      tags: ['programming', 'code-review', 'quality'],
      preview_images: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        id: 'demo-author-3',
        email: 'author3@example.com',
        full_name: 'Alex Coder'
      }
    }
  ];

  // Convert PublishedAgent to AgentType for AgentCard compatibility
  const convertToAgentType = (agent: PublishedAgent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description || '',
    creator: agent.author?.full_name || 'Unknown',
    rating: agent.rating_average,
    reviews: agent.rating_count,
    price: agent.price_type === 'free' ? 'Free' : `$${agent.price_amount}`,
    categories: [agent.category],
    capabilities: agent.tags,
    created: agent.created_at,
    coverImage: agent.preview_images[0]
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Lade Agent Store...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Store</h1>
          <p className="text-gray-600">Entdecken Sie KI-Agenten von der Community</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Agenten durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <AgentCategoryFilter
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredAgents.length} Agenten gefunden
        </p>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Beliebteste</SelectItem>
            <SelectItem value="recent">Neueste</SelectItem>
            <SelectItem value="rating">Beste Bewertung</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agent Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={convertToAgentType(agent)}
            isFavorite={favorites.has(agent.id)}
            onToggleFavorite={() => toggleFavorite(agent.id)}
            onDownload={() => downloadAgent(agent)}
            viewMode={viewMode}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Keine Agenten gefunden</p>
            <p className="text-sm mt-2">
              Versuchen Sie andere Suchbegriffe oder Filter
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
