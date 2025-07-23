
import { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useKnowledgeBuilder } from "@/hooks/use-knowledge-builder";
import { SourceList } from "@/components/knowledge/SourceList";
import { SourceDetailView } from "@/components/knowledge/SourceDetailView";
import { SourceUploadForm } from "@/components/knowledge/SourceUploadForm";
import { Book, Loader2 } from "lucide-react";

const KnowledgeBuilder = () => {
  const { sources, selectedSourceId, loading, error, loadSources } = useKnowledgeBuilder();
  const selectedSource = sources.find(s => s.id === selectedSourceId);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[calc(100vh-var(--navbar-height))]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Wissensquellen werden geladen...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[calc(100vh-var(--navbar-height))]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Fehler: {error}</p>
            <button 
              onClick={loadSources}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex h-[calc(100vh-var(--navbar-height))]">
        <aside className="w-80 border-r bg-gray-50/50 dark:bg-black/10">
          <SourceList />
        </aside>

        <main className="flex-1 overflow-y-auto">
          {selectedSource ? (
            <SourceDetailView source={selectedSource} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-lg p-8">
                <div className="mx-auto w-24 h-24 rounded-full bg-neural-100 dark:bg-neural-900/30 flex items-center justify-center mb-6">
                  <Book className="h-12 w-12 text-neural-600 dark:text-neural-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Wissen verwalten</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Wählen Sie eine Quelle aus der Liste aus, um Details anzuzeigen, oder fügen Sie eine neue Wissensquelle hinzu.
                </p>
                <div className="border rounded-lg shadow-sm bg-white dark:bg-gray-900">
                  <SourceUploadForm />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </PageLayout>
  );
};

export default KnowledgeBuilder;
