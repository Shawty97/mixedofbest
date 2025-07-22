
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useKnowledgeBuilder, KnowledgeSource as BuilderSource } from '@/hooks/use-knowledge-builder';
import { Checkbox } from '@/components/ui/checkbox';
import { File, Link as LinkIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface KnowledgeSourceSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (sources: BuilderSource[]) => void;
  existingSourceIds: string[];
}

export function KnowledgeSourceSelectModal({ open, onClose, onSelect, existingSourceIds }: KnowledgeSourceSelectModalProps) {
  const { sources } = useKnowledgeBuilder();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const readySources = sources.filter(s => s.status === 'ready' && s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedSources = readySources.filter(s => selectedIds.includes(s.id));
    onSelect(selectedSources);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Wissensquelle aus Builder auswählen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Quellen suchen..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {readySources.map(source => {
              const isExisting = existingSourceIds.includes(source.id);
              return (
              <div
                key={source.id}
                className={`flex items-center p-3 gap-3 rounded-lg ${isExisting ? 'opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}
                onClick={() => !isExisting && handleToggle(source.id)}
              >
                <Checkbox
                  id={`source-${source.id}`}
                  checked={selectedIds.includes(source.id)}
                  disabled={isExisting}
                />
                {source.type === 'file' ? <File className="w-5 h-5 text-gray-600" /> : <LinkIcon className="w-5 h-5 text-gray-600" />}
                <label htmlFor={`source-${source.id}`} className="flex-1 truncate cursor-pointer">{source.name}</label>
                {isExisting && <span className="text-sm text-gray-500">Bereits hinzugefügt</span>}
              </div>
            )})}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>
            Auswahl hinzufügen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
