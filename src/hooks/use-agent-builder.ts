
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type Personality = {
  tone: 'formal' | 'informal' | 'direct' | 'friendly';
  helpfulness: number;
};

// Fähigkeiten-Demoformat (aus Anforderungen)
export type AgentCapability = {
  id: string;
  name: string;
  description: string;
  configParams?: Record<string, any>;
};

export type KnowledgeSource = {
  id: string;
  name: string;
  type: "file" | "url";
  meta?: Record<string, any>;
};

export type AgentProfile = {
  name: string;
  description: string;
  avatar: string;
  personality: Personality;
};

export type AgentConfig = {
  id: string;
  profile: AgentProfile;
  capabilities: AgentCapability[];
  knowledge: KnowledgeSource[];
};

type AgentBuilderStore = {
  agents: AgentConfig[];
  selectedAgent?: AgentConfig | null;
  availableCapabilities: AgentCapability[];
  loading: boolean;
  error?: string | null;
  loadAgents: () => void;
  loadCapabilities: () => void;
  selectAgent: (id: string) => void;
  createAgent: () => void;
  updateAgent: (partial: Partial<AgentConfig> & { profile?: Partial<AgentProfile> }) => void;
  deleteAgent: (id: string) => void;
  saveAgent: () => void;
  addCapability: (cap: AgentCapability) => void;
  removeCapability: (id: string) => void;
  addKnowledgeSource: (src: KnowledgeSource) => void;
  removeKnowledgeSource: (id: string) => void;
  testAgent: (userPrompt: string) => Promise<{response: string}>;
}

const defaultAvatars = [
  "/agent-avatar-0.svg",
  "/agent-avatar-1.svg",
  "/agent-avatar-2.svg"
];

const initialAgents: AgentConfig[] = [
  {
    id: uuidv4(),
    profile: {
      name: "Studio-DemoAgent",
      description: "Hilft bei Textanalysen und Web-Suche.",
      avatar: defaultAvatars[0],
      personality: {
        tone: "informal",
        helpfulness: 75
      }
    },
    capabilities: [],
    knowledge: [],
  }
];
const demoCapabilities: AgentCapability[] = [
  { id: "1", name: "Textanalyse", description: "Analysiere Texte auf Stimmung und Inhalt." },
  { id: "2", name: "Datenextraktion", description: "Extrahiere strukturierte Daten aus Dokumenten." },
  { id: "3", name: "Web-Suche", description: "Beantworte Fragen durch simulierte Websuche." },
  { id: "4", name: "Kalenderzugriff", description: "Simuliere Zugriff auf den Kalender." }
];

export const useAgentBuilder = create<AgentBuilderStore>((set, get) => ({
  agents: initialAgents,
  loading: false,
  availableCapabilities: demoCapabilities,
  error: null,
  selectedAgent: initialAgents[0],
  loadAgents: () => set({ agents: initialAgents, loading: false }),
  loadCapabilities: () => set({ availableCapabilities: demoCapabilities }),
  selectAgent: (id) => set((state) => ({ selectedAgent: state.agents.find(a => a.id === id) })),
  createAgent: () => {
    const newAgent: AgentConfig = {
      id: uuidv4(),
      profile: { 
        name: "Neuer Agent", 
        description: "", 
        avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)], 
        personality: { tone: "friendly", helpfulness: 50 } 
      },
      capabilities: [],
      knowledge: [],
    };
    set((state) => ({ agents: [...state.agents, newAgent], selectedAgent: newAgent }));
  },
  updateAgent: (partial) => set((state) => {
    if (!state.selectedAgent) return {};
    const updatedAgent = {
      ...state.selectedAgent,
      ...partial,
      profile: {
        ...state.selectedAgent.profile,
        ...partial.profile,
      },
    };
    
    const newAgents = state.agents.map(a => a.id === updatedAgent.id ? updatedAgent : a);

    return { selectedAgent: updatedAgent, agents: newAgents };
  }),
  deleteAgent: (id) => set((state) => ({
    agents: state.agents.filter(a => a.id !== id),
    selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
  })),
  saveAgent: () => set((state) => {
    if (!state.selectedAgent) return {};
    return {
      agents: state.agents.map(a => a.id === state.selectedAgent!.id ? state.selectedAgent! : a)
    }
  }),
  addCapability: (cap) =>
    set((state) =>
      state.selectedAgent
        ? {
          selectedAgent: {
            ...state.selectedAgent,
            capabilities: [...state.selectedAgent.capabilities, cap],
          },
        }
        : {},
    ),
  removeCapability: (id) =>
    set((state) =>
      state.selectedAgent
        ? {
          selectedAgent: {
            ...state.selectedAgent,
            capabilities: state.selectedAgent.capabilities.filter((c) => c.id !== id),
          },
        }
        : {},
    ),
  addKnowledgeSource: (src) =>
    set((state) =>
      state.selectedAgent
        ? {
            selectedAgent: {
              ...state.selectedAgent,
              knowledge: [...state.selectedAgent.knowledge, src],
            },
          }
        : {},
    ),
  removeKnowledgeSource: (id) =>
    set((state) =>
      state.selectedAgent
        ? {
            selectedAgent: {
              ...state.selectedAgent,
              knowledge: state.selectedAgent.knowledge.filter((k) => k.id !== id),
            },
          }
        : {},
    ),
  // Simulation der Test-API
  testAgent: async (userPrompt) => {
    const agent = get().selectedAgent;
    if (!agent) return { response: "No agent selected." };
    let base = agent.profile.personality.tone === "formal"
      ? "Antwort im formellen Ton: "
      : "Antwort (locker): ";
    for (const cap of agent?.capabilities || []) {
      if (cap.name === "Web-Suche" && /(suche|finde|web)/i.test(userPrompt)) {
        return { response: `${base}Ich habe nach "${userPrompt}" gesucht (Simulation): Künstlich generierte Resultate.` };
      }
      if (cap.name === "Textanalyse" && /(stimmung|analy(s|z))/i.test(userPrompt)) {
        return { response: `${base}Simulierte Textanalyse: Die Stimmung ist positiv.` };
      }
    }
    return { response: `${base}Das ist eine allgemeine Antwort des Agenten auf "${userPrompt}". (Demo)` }
  }
}));
