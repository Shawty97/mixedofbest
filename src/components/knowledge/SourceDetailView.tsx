
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useKnowledgeBuilder, KnowledgeSource, SourceStatus } from '@/hooks/use-knowledge-builder';
import { Trash2, File, Link as LinkIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const statusMap: Record<SourceStatus, { icon: React.ReactNode; color: string; text: string }> = {
  pending: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'bg-gray-500', text: 'Ausstehend' },
  processing: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'bg-blue-500', text: 'Verarbeitung' },
  ready: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-500', text: 'Bereit' },
  error: { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-500', text: 'Fehler' },
};

export function SourceDetailView({ source }: { source: KnowledgeSource }) {
  const { removeSource } = useKnowledgeBuilder();

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {source.type === 'file' ? <File className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                <CardTitle className="truncate">{source.name}</CardTitle>
              </div>
              <CardDescription>
                Hinzugefügt am {format(new Date(source.createdAt), 'dd.MM.yyyy HH:mm')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusMap[source.status].color} text-white`}>
                {statusMap[source.status].icon}
                <span className="ml-2">{statusMap[source.status].text}</span>
              </Badge>
              <Button variant="destructive" size="icon" onClick={() => removeSource(source.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {source.status === 'error' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <p className="font-bold">Fehlermeldung</p>
              <p>{source.errorMessage || 'Ein unbekannter Fehler ist aufgetreten.'}</p>
            </div>
          )}

          {source.status === 'ready' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Simulierte Zusammenfassung</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{source.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Simulierte Schlüsselkonzepte</h3>
                <div className="flex flex-wrap gap-2">
                  {source.keywords?.map(k => <Badge key={k} variant="secondary">{k}</Badge>)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vorschau</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {source.type === 'url' && source.url ? (
            <iframe src={source.url} className="w-full h-[400px] border rounded" title="URL Preview" />
          ) : source.content ? (
            <pre className="text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap w-full h-full overflow-auto">
              {source.content}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Keine Vorschau verfügbar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
