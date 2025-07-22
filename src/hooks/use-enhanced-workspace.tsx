
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { workspaceService, Workspace, CreateWorkspaceData, ModuleAccess } from "@/services/workspace/workspaceService";
import { useEnhancedAuth } from "./use-enhanced-auth";
import { toast } from "@/hooks/use-toast";

interface EnhancedWorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  moduleAccess: ModuleAccess[];
  isLoading: boolean;
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (data: CreateWorkspaceData) => Promise<boolean>;
  selectWorkspace: (workspace: Workspace) => void;
  hasModuleAccess: (moduleName: string, level?: 'read' | 'write' | 'admin') => boolean;
}

const EnhancedWorkspaceContext = createContext<EnhancedWorkspaceContextType>({
  workspaces: [],
  currentWorkspace: null,
  moduleAccess: [],
  isLoading: false,
  loadWorkspaces: async () => {},
  createWorkspace: async () => false,
  selectWorkspace: () => {},
  hasModuleAccess: () => false,
});

export function EnhancedWorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useEnhancedAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadWorkspaces();
      loadModuleAccess();
    }
  }, [isAuthenticated, user]);

  const loadWorkspaces = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const workspaceList = await workspaceService.getWorkspaces();
      setWorkspaces(workspaceList);
      
      // Auto-select first workspace if none selected
      if (workspaceList.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(workspaceList[0]);
      }
    } catch (error) {
      console.error('Load workspaces error:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Arbeitsbereiche konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadModuleAccess = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const access = await workspaceService.getModuleAccess(user.id);
      setModuleAccess(access);
    } catch (error) {
      console.error('Load module access error:', error);
    }
  };

  const createWorkspace = async (data: CreateWorkspaceData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const newWorkspace = await workspaceService.createWorkspace(data);
      
      if (newWorkspace) {
        setWorkspaces(prev => [...prev, newWorkspace]);
        toast({
          title: "Arbeitsbereich erstellt",
          description: `${newWorkspace.name} wurde erfolgreich erstellt.`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create workspace error:', error);
      toast({
        title: "Fehler beim Erstellen",
        description: "Arbeitsbereich konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const selectWorkspace = (workspace: Workspace): void => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('current_workspace', JSON.stringify(workspace));
  };

  const hasModuleAccess = (moduleName: string, level: 'read' | 'write' | 'admin' = 'read'): boolean => {
    const access = moduleAccess.find(a => a.moduleName === moduleName);
    if (!access) return false;

    const accessLevels = ['read', 'write', 'admin'];
    const requiredLevel = accessLevels.indexOf(level);
    const userLevel = accessLevels.indexOf(access.accessLevel);
    
    return userLevel >= requiredLevel;
  };

  return (
    <EnhancedWorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        moduleAccess,
        isLoading,
        loadWorkspaces,
        createWorkspace,
        selectWorkspace,
        hasModuleAccess,
      }}
    >
      {children}
    </EnhancedWorkspaceContext.Provider>
  );
}

export const useEnhancedWorkspace = () => useContext(EnhancedWorkspaceContext);
