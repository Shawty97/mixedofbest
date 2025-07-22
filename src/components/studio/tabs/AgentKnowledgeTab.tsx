
import { useState } from 'react';
import { useAgentBuilder } from '@/hooks/use-agent-builder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Link as LinkIcon, Trash2, Plus, BrainCircuit } from 'lucide-react';
import { KnowledgeSourceSelectModal } from '@/components/knowledge/KnowledgeSourceSelectModal';
import { KnowledgeSource } from '@/hooks/use-knowledge-builder';

export default function AgentKnowledgeTab() {
  const { selectedAgent, updateAgent } = useAgentBuilder();
  const [isModalOpen, setModalOpen] = useState(false);

  if (!selectedAgent) return null;

  const handleAddSources = (newSources: KnowledgeSource[]) => {
    updateAgent({
      knowledge: [
        ...selectedAgent.knowledge,
        ...newSources.map((s) => ({ id: s.id, name: s.name, type: s.type })),
      ],
    });
  };

  const handleRemoveSource = (sourceId: string) => {
    updateAgent({
      knowledge: selectedAgent.knowledge.filter((s) => s.id !== sourceId),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
        <CardDescription>Connect knowledge sources to give your agent context.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedAgent.knowledge.length > 0 ? (
            <ul className="space-y-2">
              {selectedAgent.knowledge.map((source) => (
                <li key={source.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    {source.type === 'file' ? <File /> : <LinkIcon />}
                    <span>{source.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSource(source.id)}>
                    <Trash2 className="text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 border-dashed border-2 rounded-lg">
                <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No knowledge sources connected.</p>
                <p className="text-sm text-muted-foreground">Add sources to provide context to your agent.</p>
            </div>
          )}
          <Button onClick={() => setModalOpen(true)} className="w-full">
            <Plus className="mr-2" />
            Add Knowledge Source
          </Button>
        </div>
      </CardContent>
      <KnowledgeSourceSelectModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleAddSources}
        existingSourceIds={selectedAgent.knowledge.map(s => s.id)}
      />
    </Card>
  );
}
