
import { Card } from "@/components/ui/card";
import { Brain, ArrowRight } from "lucide-react";

interface NodeCardProps {
  title: string;
  type: "prompt" | "agent" | "output";
  description: string;
}

export function NodeCard({ title, type, description }: NodeCardProps) {
  return (
    <Card className="w-[280px] p-4 cursor-move hover:border-quantum-600 transition-colors">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-quantum-100 dark:bg-quantum-900/30 flex items-center justify-center">
          <Brain className="h-4 w-4 text-quantum-600 dark:text-quantum-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
    </Card>
  );
}
