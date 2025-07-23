
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Users, Settings, ChevronDown } from "lucide-react";
import { useEnhancedWorkspace } from "@/hooks/use-enhanced-workspace";

export function WorkspaceSelector() {
  const { 
    workspaces, 
    currentWorkspace, 
    createWorkspace, 
    selectWorkspace, 
    isLoading,
    hasModuleAccess 
  } = useEnhancedWorkspace();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: ""
  });

  const handleCreateWorkspace = async () => {
    if (!createForm.name.trim()) return;
    
    const success = await createWorkspace(createForm);
    if (success) {
      setIsCreateDialogOpen(false);
      setCreateForm({ name: "", description: "" });
    }
  };

  const getAccessBadgeColor = (moduleName: string) => {
    if (hasModuleAccess(moduleName, 'admin')) return 'bg-green-100 text-green-800';
    if (hasModuleAccess(moduleName, 'write')) return 'bg-blue-100 text-blue-800';
    if (hasModuleAccess(moduleName, 'read')) return 'bg-gray-100 text-gray-800';
    return 'bg-red-100 text-red-800';
  };

  const getAccessLevel = (moduleName: string) => {
    if (hasModuleAccess(moduleName, 'admin')) return 'Admin';
    if (hasModuleAccess(moduleName, 'write')) return 'Schreiben';
    if (hasModuleAccess(moduleName, 'read')) return 'Lesen';
    return 'Kein Zugriff';
  };

  return (
    <div className="space-y-4">
      {/* Current Workspace Display */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-quantum-600" />
              <CardTitle className="text-lg">Aktueller Arbeitsbereich</CardTitle>
            </div>
            <Select 
              value={currentWorkspace?.id || ""} 
              onValueChange={(value) => {
                const workspace = workspaces.find(w => w.id === value);
                if (workspace) selectWorkspace(workspace);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Arbeitsbereich wählen" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        {currentWorkspace && (
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">{currentWorkspace.name}</h3>
                {currentWorkspace.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentWorkspace.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Erstellt: {new Date(currentWorkspace.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
              
              {/* Module Access Display */}
              <div>
                <h4 className="text-sm font-medium mb-2">Modulzugriff:</h4>
                <div className="flex flex-wrap gap-2">
                  {['core-platform', 'studio', 'agent-store', 'knowledge-builder'].map((module) => (
                    <Badge
                      key={module}
                      className={getAccessBadgeColor(module)}
                      variant="secondary"
                    >
                      {module}: {getAccessLevel(module)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Create New Workspace */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Neuen Arbeitsbereich erstellen
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Arbeitsbereich erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Arbeitsbereich für Ihre KI-Projekte.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Name *</Label>
              <Input
                id="workspace-name"
                placeholder="Mein KI-Projekt"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workspace-description">Beschreibung</Label>
              <Textarea
                id="workspace-description"
                placeholder="Beschreibung des Arbeitsbereichs..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleCreateWorkspace}
              disabled={!createForm.name.trim() || isLoading}
            >
              {isLoading ? "Erstelle..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
