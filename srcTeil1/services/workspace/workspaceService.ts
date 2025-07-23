
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
}

export interface ModuleAccess {
  id: string;
  userId: string;
  moduleName: string;
  accessLevel: 'read' | 'write' | 'admin';
  grantedAt: string;
}

class WorkspaceService {
  private baseUrl = '/api/workspaces';

  // Demo mode workspace management
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      // Demo mode simulation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const demoWorkspaces: Workspace[] = [
        {
          id: 'workspace-1',
          name: 'Demo Workspace',
          description: 'Ihr Haupt-Arbeitsbereich für KI-Workflows',
          ownerId: 'demo-user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'workspace-2',
          name: 'Experimenteller Bereich',
          description: 'Für das Testen neuer KI-Agenten und Workflows',
          ownerId: 'demo-user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return demoWorkspaces;
    } catch (error) {
      console.error('Get workspaces error:', error);
      return [];
    }
  }

  async createWorkspace(data: CreateWorkspaceData): Promise<Workspace | null> {
    try {
      // Demo mode simulation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newWorkspace: Workspace = {
        id: 'workspace-' + Date.now(),
        name: data.name,
        description: data.description,
        ownerId: 'demo-user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return newWorkspace;
    } catch (error) {
      console.error('Create workspace error:', error);
      return null;
    }
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    try {
      // Demo mode simulation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const workspaces = await this.getWorkspaces();
      return workspaces.find(w => w.id === id) || null;
    } catch (error) {
      console.error('Get workspace error:', error);
      return null;
    }
  }

  async updateWorkspace(id: string, data: Partial<CreateWorkspaceData>): Promise<Workspace | null> {
    try {
      // Demo mode simulation
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const workspace = await this.getWorkspace(id);
      if (!workspace) return null;

      return {
        ...workspace,
        ...data,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Update workspace error:', error);
      return null;
    }
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    try {
      // Demo mode simulation
      await new Promise(resolve => setTimeout(resolve, 400));
      
      console.log('Demo: Workspace deleted:', id);
      return true;
    } catch (error) {
      console.error('Delete workspace error:', error);
      return false;
    }
  }

  // Module access management
  async getModuleAccess(userId: string): Promise<ModuleAccess[]> {
    try {
      // Demo mode simulation
      const demoAccess: ModuleAccess[] = [
        {
          id: 'access-1',
          userId,
          moduleName: 'core-platform',
          accessLevel: 'admin',
          grantedAt: new Date().toISOString()
        },
        {
          id: 'access-2',
          userId,
          moduleName: 'studio',
          accessLevel: 'write',
          grantedAt: new Date().toISOString()
        },
        {
          id: 'access-3',
          userId,
          moduleName: 'agent-store',
          accessLevel: 'read',
          grantedAt: new Date().toISOString()
        },
        {
          id: 'access-4',
          userId,
          moduleName: 'knowledge-builder',
          accessLevel: 'write',
          grantedAt: new Date().toISOString()
        }
      ];

      return demoAccess;
    } catch (error) {
      console.error('Get module access error:', error);
      return [];
    }
  }
}

export const workspaceService = new WorkspaceService();
