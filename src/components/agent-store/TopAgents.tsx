
import { Brain, Database, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TopAgents() {
  const navigate = useNavigate();
  
  const topAgents = [
    { 
      name: "Data Analyst Pro", 
      icon: Database, 
      downloads: 1245,
      type: "agent-store" 
    },
    { 
      name: "Content Writer", 
      icon: Brain, 
      downloads: 982,
      type: "agent-store" 
    },
    { 
      name: "Customer Support", 
      icon: Mic, 
      downloads: 1320,
      type: "voice-agents",
      highlight: true
    }
  ];
  
  const handleAgentClick = (type: string) => {
    if (type === "voice-agents") {
      navigate("/voice-agents");
    } else {
      navigate("/agent-store");
    }
  };
  
  return (
    <div className="space-y-2">
      {topAgents.map((agent, index) => (
        <div 
          key={index} 
          className={`flex items-center justify-between p-2 rounded-md 
            ${agent.highlight 
              ? 'bg-quantum-50 hover:bg-quantum-100 dark:bg-quantum-900/30 dark:hover:bg-quantum-900/50' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'} 
            transition-colors cursor-pointer`}
          onClick={() => handleAgentClick(agent.type)}
        >
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full 
              ${agent.highlight 
                ? 'bg-quantum-100 dark:bg-quantum-800' 
                : 'bg-quantum-100 dark:bg-quantum-900'} 
              flex items-center justify-center`}>
              <agent.icon className={`h-3 w-3 
                ${agent.highlight ? 'text-quantum-600' : 'text-quantum-600'}`} />
            </div>
            <span className={`text-sm ${agent.highlight ? 'font-medium' : ''}`}>
              {agent.name}
              {agent.highlight && (
                <span className="ml-1 text-xs text-quantum-600">(Voice)</span>
              )}
            </span>
          </div>
          <span className="text-xs text-gray-500">{agent.downloads}</span>
        </div>
      ))}
    </div>
  );
}
