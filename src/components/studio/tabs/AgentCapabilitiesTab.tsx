
import { AgentCapabilityDnD } from "@/components/studio/AgentCapabilityDnD";
import { useAgentBuilder, AgentCapability } from "@/hooks/use-agent-builder";

export default function AgentCapabilitiesTab() {
  const { selectedAgent, availableCapabilities, addCapability, removeCapability } = useAgentBuilder();

  if (!selectedAgent) return null;

  return (
    <div>
        <AgentCapabilityDnD
            available={availableCapabilities.filter(
              (c) => !selectedAgent.capabilities.find((ac) => ac.id === c.id)
            )}
            assigned={selectedAgent.capabilities}
            onAdd={addCapability}
            onRemove={removeCapability}
            onConfigure={(capability: AgentCapability) => alert(`Configure ${capability.name}`)}
        />
    </div>
  );
}
