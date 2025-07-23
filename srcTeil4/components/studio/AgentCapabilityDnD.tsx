
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Cog } from "lucide-react";
type Capability = { id: string; name: string; description: string };

export function AgentCapabilityDnD({
  available,
  assigned,
  onAdd,
  onRemove,
  onConfigure
}: {
  available: Capability[];
  assigned: Capability[];
  onAdd: (cap: Capability) => void;
  onRemove: (id: string) => void;
  onConfigure: (cap: Capability) => void;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <div className="font-semibold mb-2">Verfügbare Fähigkeiten</div>
        <ul className="space-y-1">
          {available.map((cap) => (
            <li key={cap.id} className="flex items-center justify-between p-2 border rounded">
              <span>{cap.name}</span>
              <Button
                size="sm"
                onClick={() => onAdd(cap)}
                title="Fähigkeit hinzufügen"
                aria-label={`Fähigkeit ${cap.name} hinzufügen`}
              >
                <Plus className="w-4 h-4 mr-1" /> Hinzufügen
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <div className="font-semibold mb-2">Aktive Fähigkeiten</div>
        <ul className="space-y-1">
          {assigned.map((cap) => (
            <li key={cap.id} className="flex gap-2 items-center justify-between p-2 border rounded">
              <span>{cap.name}</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onConfigure(cap)}
                  title="Fähigkeit konfigurieren"
                  aria-label={`Fähigkeit ${cap.name} konfigurieren`}
                >
                  <Cog className="w-4 h-4 mr-1" />
                  Konfigurieren
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRemove(cap.id)}
                  title="Fähigkeit entfernen"
                  aria-label={`Fähigkeit ${cap.name} entfernen`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
