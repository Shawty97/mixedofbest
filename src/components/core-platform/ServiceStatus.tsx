
import { StatusBadge } from "@/components/ui/status-badge";

export function ServiceStatus() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium mb-4">Service Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">API</span>
          <StatusBadge status="success" text="Operational" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Prompt Parser</span>
          <StatusBadge status="success" text="Operational" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Agent Orchestrator</span>
          <StatusBadge status="success" text="Operational" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Learning Engine</span>
          <StatusBadge status="warning" text="Optimizing" />
        </div>
      </div>
    </div>
  );
}
