
import { ArrowRight } from "lucide-react";

export function QuickLinks() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium mb-4">Quick Links</h3>
      <ul className="space-y-2">
        <li>
          <a href="#" className="text-quantum-600 hover:text-quantum-700 dark:text-quantum-400 dark:hover:text-quantum-300 flex items-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            API Reference
          </a>
        </li>
        <li>
          <a href="#" className="text-quantum-600 hover:text-quantum-700 dark:text-quantum-400 dark:hover:text-quantum-300 flex items-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            Prompt DSL Guide
          </a>
        </li>
        <li>
          <a href="#" className="text-quantum-600 hover:text-quantum-700 dark:text-quantum-400 dark:hover:text-quantum-300 flex items-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            Agent Orchestration
          </a>
        </li>
        <li>
          <a href="#" className="text-quantum-600 hover:text-quantum-700 dark:text-quantum-400 dark:hover:text-quantum-300 flex items-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            Docker Setup
          </a>
        </li>
      </ul>
    </div>
  );
}
