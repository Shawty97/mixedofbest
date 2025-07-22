
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useKnowledgeBuilder, KnowledgeSource, SourceStatus } from '@/hooks/use-knowledge-builder';
import { Plus, File, Link as LinkIcon, AlertCircle, CheckCircle, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusIconMap: Record<SourceStatus, React.ReactNode> = {
  pending: <Loader2 className="w-4 h-4 animate-spin text-gray-500" />,
  processing: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
  ready: <CheckCircle className="w-4 h-4 text-green-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
};

function SourceItem({ source, isSelected, onSelect }: { source: KnowledgeSource; isSelected: boolean; onSelect: () => void; }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center p-3 gap-3 cursor-pointer rounded-lg transition-colors',
        isSelected ? 'bg-primary/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      <div className="flex-shrink-0">
        {source.type === 'file' ? <File className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
      </div>
      <div className="flex-1 truncate">
        <p className="font-medium text-sm truncate">{source.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{source.type === 'file' ? 'Datei' : 'URL'}</p>
      </div>
      <div className="flex-shrink-0">
        {statusIconMap[source.status]}
      </div>
    </div>
  );
}

export function SourceList() {
  const { sources, selectedSourceId, selectSource } = useKnowledgeBuilder();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSources = sources.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Wissensquellen</h2>
        <Button size="sm" onClick={() => selectSource(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Neue Quelle
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Quellen suchen..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {filteredSources.length > 0 ? (
          filteredSources.map((source) => (
            <SourceItem
              key={source.id}
              source={source}
              isSelected={selectedSourceId === source.id}
              onSelect={() => selectSource(source.id)}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Keine Quellen gefunden.</p>
          </div>
        )}
      </div>
    </div>
  );
}
