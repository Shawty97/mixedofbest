
import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api';

export type SourceType = 'file' | 'url';
export type SourceStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface KnowledgeSource {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  createdAt: string;
  content?: string;
  url?: string;
  summary?: string;
  keywords?: string[];
  errorMessage?: string;
  source_uri?: string;
  metadata?: any;
}

interface ApiKnowledgeSource {
  id: number;
  name: string;
  type: SourceType;
  status: SourceStatus;
  created_at: string;
  source_uri?: string;
  metadata?: any;
}

interface KnowledgeBuilderState {
  sources: KnowledgeSource[];
  selectedSourceId: string | null;
  loading: boolean;
  error: string | null;
  loadSources: () => Promise<void>;
  addSource: (sourceData: { name: string; type: SourceType; content?: string; url?: string }) => Promise<void>;
  removeSource: (id: string) => Promise<void>;
  selectSource: (id: string | null) => void;
  updateSourceStatus: (id: string, status: SourceStatus, data?: Partial<KnowledgeSource>) => void;
}

export const useKnowledgeBuilder = create<KnowledgeBuilderState>((set, get) => ({
  sources: [],
  selectedSourceId: null,
  loading: false,
  error: null,

  selectSource: (id) => set({ selectedSourceId: id }),

  loadSources: async () => {
    set({ loading: true, error: null });
    try {
      const sources = await apiClient.getKnowledgeSources() as ApiKnowledgeSource[];
      const mappedSources = sources.map((source: ApiKnowledgeSource) => ({
        id: source.id.toString(),
        name: source.name,
        type: source.type,
        status: source.status,
        createdAt: source.created_at,
        source_uri: source.source_uri,
        metadata: source.metadata,
        summary: source.metadata?.summary,
        keywords: source.metadata?.keywords,
        errorMessage: source.metadata?.error_message,
      }));
      set({ sources: mappedSources, loading: false });
    } catch (error: any) {
      console.error('Failed to load knowledge sources:', error);
      set({ error: error.message, loading: false });
      toast({ 
        title: 'Fehler beim Laden', 
        description: 'Wissensquellen konnten nicht geladen werden.', 
        variant: 'destructive' 
      });
    }
  },

  addSource: async ({ name, type, content, url }) => {
    try {
      const sourceData = {
        name,
        type,
        source_uri: type === 'url' ? url : name,
        metadata: type === 'file' ? { content } : { url }
      };

      const newSource = await apiClient.createKnowledgeSource(sourceData) as ApiKnowledgeSource;
      
      const mappedSource: KnowledgeSource = {
        id: newSource.id.toString(),
        name: newSource.name,
        type: newSource.type,
        status: newSource.status,
        createdAt: newSource.created_at,
        source_uri: newSource.source_uri,
        metadata: newSource.metadata,
        ...(type === 'file' && { content }),
        ...(type === 'url' && { url }),
      };

      set((state) => ({ 
        sources: [mappedSource, ...state.sources], 
        selectedSourceId: mappedSource.id 
      }));

      // Simulate processing updates (since backend doesn't have real processing yet)
      setTimeout(() => {
        get().updateSourceStatus(mappedSource.id, 'processing');
      }, 1000);

      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        if (success) {
          get().updateSourceStatus(mappedSource.id, 'ready', {
            summary: `Dies ist eine simulierte Zusammenfassung für ${name}.`,
            keywords: ['simuliert', 'extrahiert', 'konzept']
          });
          toast({ title: 'Verarbeitung abgeschlossen', description: `${name} ist jetzt bereit.` });
        } else {
          get().updateSourceStatus(mappedSource.id, 'error', {
            errorMessage: 'Simulierter Verarbeitungsfehler.'
          });
          toast({ title: 'Verarbeitung fehlgeschlagen', description: `Bei ${name} ist ein Fehler aufgetreten.`, variant: 'destructive' });
        }
      }, 4000);

    } catch (error: any) {
      console.error('Failed to create knowledge source:', error);
      toast({ 
        title: 'Fehler beim Hinzufügen', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  },

  removeSource: async (id) => {
    try {
      await apiClient.deleteKnowledgeSource(id);
      set((state) => ({
        sources: state.sources.filter((s) => s.id !== id),
        selectedSourceId: state.selectedSourceId === id ? null : state.selectedSourceId,
      }));
      toast({ title: 'Quelle gelöscht', description: 'Die Wissensquelle wurde entfernt.' });
    } catch (error: any) {
      console.error('Failed to delete knowledge source:', error);
      toast({ 
        title: 'Fehler beim Löschen', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  },

  updateSourceStatus: (id, status, data) => {
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === id ? { ...s, status, ...data } : s
      ),
    }));
  },
}));
