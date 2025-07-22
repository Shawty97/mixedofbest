
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const initialCategories = [
  "Marketing",
  "Vertrieb",
  "Support",
  "Entwicklung",
  "Bildung"
];

const demoAgents = [
  {
    id: "1",
    name: "MarketingBot",
    avatar: "/agent-avatar-1.svg",
    description: "Automatisiert Marketing-Aufgaben.",
    rating: 4.5,
    reviews: 12,
    developer: "Max Mustermann",
    price: "Kostenlos",
    category: "Marketing"
  },
  {
    id: "2",
    name: "SupportGuide",
    avatar: "/agent-avatar-2.svg",
    description: "Kundenanfragen automatisch beantworten.",
    rating: 4.2,
    reviews: 8,
    developer: "Lisa Demo",
    price: "12€",
    category: "Support"
  },
  {
    id: "3",
    name: "DevHelper AI",
    avatar: "/agent-avatar-0.svg",
    description: "Hilft Entwicklern beim Debugging.",
    rating: 5.0,
    reviews: 5,
    developer: "Tech UG",
    price: "29€",
    category: "Entwicklung"
  }
];

type StoreAgent = typeof demoAgents[0];

type AgentStoreDemoState = {
  categories: string[];
  agents: StoreAgent[];
  filtered: StoreAgent[];
  myAgents: StoreAgent[];
  filter: string | null;
  search: string;
  setSearch: (q: string) => void;
  setFilter: (k: string | null) => void;
  install: (id: string) => void;
};
export const useAgentStoreDemo = create<AgentStoreDemoState>((set, get) => ({
  categories: initialCategories,
  agents: demoAgents,
  filtered: demoAgents,
  myAgents: [],
  filter: null,
  search: "",
  setSearch: (q) => {
    const query = q.toLowerCase();
    setTimeout(() => {
      set((state) => {
        const filteredAgents = state.agents.filter((agent) => {
          const matchesCategory = !state.filter || agent.category === state.filter;
          const matchesSearch = !q || agent.name.toLowerCase().includes(query) || agent.description.toLowerCase().includes(query);
          return matchesCategory && matchesSearch;
        });
        return { search: q, filtered: filteredAgents };
      });
    }, 120);
  },
  setFilter: (k) =>
    set((state) => {
      const query = state.search.toLowerCase();
      const filteredAgents = state.agents.filter((agent) => {
        const matchesCategory = !k || agent.category === k;
        const matchesSearch = !state.search || agent.name.toLowerCase().includes(query) || agent.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      });
      return { filter: k, filtered: filteredAgents };
    }),
  install: (id) =>
    set((state) => {
      const agent = state.agents.find((a) => a.id === id);
      return agent && !state.myAgents.some((a) => a.id === id)
        ? { myAgents: [...state.myAgents, agent] }
        : {};
    })
}));
