
import { useState } from "react";

export const demoCapabilities = [
  { id: "1", name: "Textanalyse", description: "Analysiere Texte auf Stimmung und Inhalt." },
  { id: "2", name: "Datenextraktion", description: "Extrahiere strukturierte Daten aus Dokumenten." },
  { id: "3", name: "Web-Suche", description: "Simulierte Web-Suche." },
  { id: "4", name: "Kalenderzugriff", description: "Simulierter Kalenderzugriff." }
];

export function useAgentsApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo-API: in echt gegen echtes Backend austauschen!
  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simuliert fetch("/agents")
      await new Promise(r => setTimeout(r, 200));
      const agents = JSON.parse(localStorage.getItem("agents") || "[]");
      setLoading(false);
      return agents;
    } catch (e:any) {
      setError("Fehler beim Laden der Agenten");
      setLoading(false);
      return [];
    }
  };

  const saveAgent = async (agent: any) => {
    setLoading(true);
    setError(null);
    try {
      // Demo-Speicher (lokal)
      const agents = JSON.parse(localStorage.getItem("agents") || "[]");
      let updated: any[];
      if (agents.find((a:any) => a.id === agent.id)) {
        updated = agents.map((a:any) => a.id === agent.id ? agent : a);
      } else {
        updated = [...agents, agent];
      }
      localStorage.setItem("agents", JSON.stringify(updated));
      setLoading(false);
      return agent;
    } catch (e) {
      setError("Speichern fehlgeschlagen");
      setLoading(false);
      return null;
    }
  };

  const deleteAgent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      let agents = JSON.parse(localStorage.getItem("agents") || "[]");
      agents = agents.filter((a:any) => a.id !== id);
      localStorage.setItem("agents", JSON.stringify(agents));
      setLoading(false);
      return true;
    } catch (e) {
      setError("Löschen fehlgeschlagen");
      setLoading(false);
      return false;
    }
  };

  const fetchCapabilities = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simuliert fetch("/capabilities")
      await new Promise(r => setTimeout(r, 100));
      setLoading(false);
      return demoCapabilities;
    } catch (e) {
      setError("Capabilities konnten nicht geladen werden");
      setLoading(false);
      return [];
    }
  };

  const testAgent = async (agent: any, prompt: string) => {
    // Demo-Simulation
    await new Promise(r => setTimeout(r, 450));
    let base =
      agent.profile?.personality === "formell"
        ? "Antwort im formellen Ton: "
        : "Antwort (locker): ";
    const caps = agent.capabilities || [];
    if (caps.find((c: any) => c.name === "Web-Suche") && /(suche|finde|web)/i.test(prompt)) {
      return { response: `${base}Ich habe nach "${prompt}" gesucht (Simulation): Künstlich generierte Resultate.` };
    }
    if (caps.find((c: any) => c.name === "Textanalyse") && /(stimmung|analy(s|z))/i.test(prompt)) {
      return { response: `${base}Simulierte Textanalyse: Die Stimmung ist positiv.` };
    }
    return { response: `${base}Das ist eine allgemeine Antwort des Agenten auf "${prompt}". (Demo)` }
  };

  return {
    loading,
    error,
    fetchAgents,
    saveAgent,
    deleteAgent,
    fetchCapabilities,
    testAgent
  };
}
