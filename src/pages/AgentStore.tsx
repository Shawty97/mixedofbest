
import { useAgentStoreDemo } from "@/hooks/use-agent-store-demo";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Star, Bookmark, Loader2, Filter, Grid, List, Download, User, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AgentCardDemo = ({ agent, onInstall, isInstalled }: { agent: any; onInstall: () => void; isInstalled: boolean }) => (
  <Card className="flex flex-col h-full transition-all hover:shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-3">
        <img src={agent.avatar} className="w-12 h-12 rounded-full bg-gray-100" alt={agent.name} />
        <div className="flex-1">
          <CardTitle className="text-lg line-clamp-1">{agent.name}</CardTitle>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            {agent.developer}
          </div>
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="flex-1 pt-0">
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{agent.description}</p>
      
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="text-xs">
          {agent.category}
        </Badge>
        <Badge variant={agent.price === "Kostenlos" ? "default" : "outline"} className="text-xs">
          <DollarSign className="w-3 h-3 mr-1" />
          {agent.price}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="font-medium">{agent.rating}</span>
        </div>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">({agent.reviews} Bewertungen)</span>
      </div>
    </CardContent>
    
    <CardFooter className="pt-4">
      <Button 
        className="w-full" 
        onClick={onInstall}
        variant={isInstalled ? "secondary" : "default"}
        disabled={isInstalled}
      >
        {isInstalled ? (
          <>
            <Bookmark className="w-4 h-4 mr-2 fill-current" />
            Installiert
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Installieren
          </>
        )}
      </Button>
    </CardFooter>
  </Card>
);

const FilterSidebar = ({ 
  categories, 
  activeFilter, 
  onFilterChange, 
  priceFilter, 
  onPriceFilterChange,
  ratingFilter,
  onRatingFilterChange 
}: {
  categories: string[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  priceFilter: string;
  onPriceFilterChange: (filter: string) => void;
  ratingFilter: number;
  onRatingFilterChange: (rating: number) => void;
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Kategorien
      </h3>
      <ul className="space-y-2">
        <li>
          <button 
            className={`w-full text-left p-2 rounded text-sm transition-colors ${
              !activeFilter ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100"
            }`}
            onClick={() => onFilterChange(null)}
          >
            Alle Kategorien
          </button>
        </li>
        {categories.map(kat => (
          <li key={kat}>
            <button
              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                activeFilter === kat ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100"
              }`}
              onClick={() => onFilterChange(kat)}
            >
              {kat}
            </button>
          </li>
        ))}
      </ul>
    </div>
    
    <div>
      <h3 className="font-semibold mb-3">Preis</h3>
      <Select value={priceFilter} onValueChange={onPriceFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Preis auswählen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Alle Preise</SelectItem>
          <SelectItem value="kostenlos">Kostenlos</SelectItem>
          <SelectItem value="bezahlt">Bezahlt</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div>
      <h3 className="font-semibold mb-3">Mindestbewertung</h3>
      <div className="space-y-2">
        {[0, 3, 4, 4.5].map(rating => (
          <button
            key={rating}
            className={`w-full text-left p-2 rounded text-sm transition-colors flex items-center gap-2 ${
              ratingFilter === rating ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100"
            }`}
            onClick={() => onRatingFilterChange(rating)}
          >
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{rating === 0 ? "Alle" : `${rating}+`}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default function AgentStore() {
  const {
    categories, filtered, filter, setFilter, setSearch, install, myAgents
  } = useAgentStoreDemo();
  
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('alle');
  const [ratingFilter, setRatingFilter] = useState(0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, setSearch]);

  const handleInstall = (agentId: string) => {
    setLoading(true);
    setTimeout(() => {
      install(agentId);
      setLoading(false);
      toast({ 
        title: "Agent installiert!", 
        description: "Der Agent wurde erfolgreich zu Ihrer Sammlung hinzugefügt." 
      });
    }, 800);
  };

  const isAgentInstalled = (agentId: string) => {
    return myAgents.some(agent => agent.id === agentId);
  };

  // Filter agents by price and rating
  const filteredAgents = filtered.filter(agent => {
    const priceMatch = priceFilter === 'alle' || 
      (priceFilter === 'kostenlos' && agent.price === 'Kostenlos') ||
      (priceFilter === 'bezahlt' && agent.price !== 'Kostenlos');
    
    const ratingMatch = ratingFilter === 0 || agent.rating >= ratingFilter;
    
    return priceMatch && ratingMatch;
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r p-6">
        <h2 className="font-bold text-lg mb-6">Filter</h2>
        <FilterSidebar
          categories={categories}
          activeFilter={filter}
          onFilterChange={setFilter}
          priceFilter={priceFilter}
          onPriceFilterChange={setPriceFilter}
          ratingFilter={ratingFilter}
          onRatingFilterChange={setRatingFilter}
        />
      </aside>
      
      {/* Main area */}
      <main className="flex-1">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Agent Store</h1>
            <p className="text-gray-600">Entdecken Sie KI-Agenten für jeden Anwendungsfall</p>
          </div>
          
          {/* Search and Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10"
                placeholder="Agenten suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredAgents.length} {filteredAgents.length === 1 ? 'Agent gefunden' : 'Agenten gefunden'}
            </p>
          </div>
          
          {/* Agents Grid/List */}
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="browse">Durchsuchen</TabsTrigger>
              <TabsTrigger value="installed">
                Meine Agenten ({myAgents.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse">
              {filteredAgents.length === 0 ? (
                <div className="text-center py-16">
                  <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">Keine Agenten gefunden</h3>
                  <p className="text-gray-600">Versuchen Sie andere Suchbegriffe oder Filter</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "space-y-4"
                }>
                  {filteredAgents.map(agent => (
                    <AgentCardDemo
                      key={agent.id}
                      agent={agent}
                      onInstall={() => handleInstall(agent.id)}
                      isInstalled={isAgentInstalled(agent.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="installed">
              {myAgents.length === 0 ? (
                <div className="text-center py-16">
                  <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">Noch keine Agenten installiert</h3>
                  <p className="text-gray-600">Installieren Sie Agenten aus dem Store, um hier zu starten</p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {myAgents.map(agent => (
                    <Card key={agent.id} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={agent.avatar} className="w-10 h-10 rounded-full" alt={agent.name} />
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-gray-500">{agent.category}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        In Studio öffnen
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {loading && (
            <div className="fixed bottom-4 right-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Agent wird installiert...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
