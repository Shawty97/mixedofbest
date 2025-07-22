
import { create } from 'zustand';
import { UserWorkspace, AgentCollection, TeamMember, AgentSessionLog } from '@/types/agent.types';

interface UserWorkspaceState {
  workspace: UserWorkspace | null;
  isOnboardingOpen: boolean;
  createWorkspace: (workspace: Partial<UserWorkspace>) => void;
  updateWorkspace: (workspace: Partial<UserWorkspace>) => void;
  hireAgent: (agentId: string) => void;
  removeAgent: (agentId: string) => void;
  createCollection: (name: string, description?: string) => void;
  updateCollection: (collectionId: string, updates: Partial<AgentCollection>) => void;
  removeCollection: (collectionId: string) => void;
  addAgentToCollection: (agentId: string, collectionId: string) => void;
  removeAgentFromCollection: (agentId: string, collectionId: string) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (memberId: string) => void;
  logAgentSession: (log: AgentSessionLog) => void;
  getAgentLogs: (agentId?: string) => AgentSessionLog[];
  setOnboardingOpen: (isOpen: boolean) => void;
  checkFirstTimeUser: () => boolean;
}

export const useUserWorkspace = create<UserWorkspaceState>((set, get) => ({
  workspace: null,
  isOnboardingOpen: false,
  
  createWorkspace: (workspaceData) => {
    const defaultCollection: AgentCollection = {
      id: `collection-${Date.now()}`,
      name: 'Favorites',
      description: 'Your favorite agents',
      agentIds: [],
      isDefault: true
    };
    
    const workspace: UserWorkspace = {
      id: `workspace-${Date.now()}`,
      name: workspaceData.name || 'My AI Workforce',
      description: workspaceData.description,
      ownerId: 'current-user',
      createdAt: new Date(),
      hiredAgents: [],
      collections: [defaultCollection],
      team: [
        {
          id: 'owner',
          name: 'Current User',
          email: 'user@example.com',
          role: 'owner',
          permissions: {
            canCreateAgents: true,
            canHireAgents: true,
            canModifyWorkspace: true
          }
        }
      ],
      agentLogs: [],
      settings: workspaceData.settings || {
        theme: 'system',
        defaultAgentDisplay: 'grid',
        notifications: true,
        autoImprovement: true,
        sessionContinuity: false,
        defaultVoiceSettings: {
          enabled: false
        }
      },
      onboardingCompleted: true
    };
    
    set({ workspace, isOnboardingOpen: false });
    
    // Save to localStorage for persistence
    localStorage.setItem('userWorkspace', JSON.stringify(workspace));
  },
  
  updateWorkspace: (updates) => {
    set((state) => {
      if (!state.workspace) return state;
      
      const updated = {
        ...state.workspace,
        ...updates,
        settings: {
          ...state.workspace.settings,
          ...(updates.settings || {})
        }
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  hireAgent: (agentId) => {
    set((state) => {
      if (!state.workspace) return state;
      
      // Prevent duplicate hires
      if (state.workspace.hiredAgents.includes(agentId)) return state;
      
      const updated = {
        ...state.workspace,
        hiredAgents: [...state.workspace.hiredAgents, agentId]
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  removeAgent: (agentId) => {
    set((state) => {
      if (!state.workspace) return state;
      
      const updated = {
        ...state.workspace,
        hiredAgents: state.workspace.hiredAgents.filter(id => id !== agentId),
        // Also remove from all collections
        collections: state.workspace.collections.map(collection => ({
          ...collection,
          agentIds: collection.agentIds.filter(id => id !== agentId)
        }))
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  createCollection: (name, description) => {
    set((state) => {
      if (!state.workspace) return state;
      
      const newCollection: AgentCollection = {
        id: `collection-${Date.now()}`,
        name,
        description,
        agentIds: [],
        isDefault: false
      };
      
      const updated = {
        ...state.workspace,
        collections: [...state.workspace.collections, newCollection]
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  updateCollection: (collectionId, updates) => {
    set((state) => {
      if (!state.workspace) return state;
      
      const updated = {
        ...state.workspace,
        collections: state.workspace.collections.map(collection => 
          collection.id === collectionId 
            ? { ...collection, ...updates } 
            : collection
        )
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  removeCollection: (collectionId) => {
    set((state) => {
      if (!state.workspace) return state;
      
      // Don't remove default collection
      const collection = state.workspace.collections.find(c => c.id === collectionId);
      if (collection?.isDefault) return state;
      
      const updated = {
        ...state.workspace,
        collections: state.workspace.collections.filter(c => c.id !== collectionId)
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  addAgentToCollection: (agentId, collectionId) => {
    set((state) => {
      if (!state.workspace) return state;
      
      const updated = {
        ...state.workspace,
        collections: state.workspace.collections.map(collection => {
          if (collection.id === collectionId && !collection.agentIds.includes(agentId)) {
            return {
              ...collection,
              agentIds: [...collection.agentIds, agentId]
            };
          }
          return collection;
        })
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  removeAgentFromCollection: (agentId, collectionId) => {
    set((state) => {
      if (!state.workspace) return state;
      
      const updated = {
        ...state.workspace,
        collections: state.workspace.collections.map(collection => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              agentIds: collection.agentIds.filter(id => id !== agentId)
            };
          }
          return collection;
        })
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  // Team management
  addTeamMember: (member) => {
    set((state) => {
      if (!state.workspace) return state;
      
      const team = state.workspace.team || [];
      
      // Check if email already exists
      if (team.some(m => m.email === member.email)) {
        return state;
      }
      
      const updated = {
        ...state.workspace,
        team: [...team, member]
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  updateTeamMember: (memberId, updates) => {
    set((state) => {
      if (!state.workspace || !state.workspace.team) return state;
      
      const updated = {
        ...state.workspace,
        team: state.workspace.team.map(member =>
          member.id === memberId ? { ...member, ...updates } : member
        )
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  removeTeamMember: (memberId) => {
    set((state) => {
      if (!state.workspace || !state.workspace.team) return state;
      
      // Don't remove owner
      const member = state.workspace.team.find(m => m.id === memberId);
      if (member?.role === 'owner') return state;
      
      const updated = {
        ...state.workspace,
        team: state.workspace.team.filter(m => m.id !== memberId)
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  // Agent logs
  logAgentSession: (log) => {
    set((state) => {
      if (!state.workspace) return state;
      
      const agentLogs = state.workspace.agentLogs || [];
      
      const updated = {
        ...state.workspace,
        agentLogs: [...agentLogs, log]
      };
      
      localStorage.setItem('userWorkspace', JSON.stringify(updated));
      
      return { workspace: updated };
    });
  },
  
  getAgentLogs: (agentId) => {
    const state = get();
    if (!state.workspace || !state.workspace.agentLogs) return [];
    
    return agentId
      ? state.workspace.agentLogs.filter(log => log.agentId === agentId)
      : state.workspace.agentLogs;
  },
  
  setOnboardingOpen: (isOpen) => {
    set({ isOnboardingOpen: isOpen });
  },
  
  checkFirstTimeUser: () => {
    // Check if user has completed onboarding
    const savedWorkspace = localStorage.getItem('userWorkspace');
    if (savedWorkspace) {
      try {
        const workspace = JSON.parse(savedWorkspace);
        
        // Convert date strings back to Date objects
        if (workspace.createdAt) {
          workspace.createdAt = new Date(workspace.createdAt);
        }
        
        if (workspace.agentLogs) {
          workspace.agentLogs = workspace.agentLogs.map((log: any) => ({
            ...log,
            startTime: log.startTime ? new Date(log.startTime) : new Date(),
            endTime: log.endTime ? new Date(log.endTime) : undefined
          }));
        }
        
        set({ workspace });
        return false;
      } catch (error) {
        console.error("Error parsing workspace from localStorage:", error);
        return true;
      }
    }
    
    return true;
  }
}));
