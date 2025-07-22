
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:border-quantum-500 dark:hover:border-quantum-500 transition-all duration-300 hover:shadow-md">
      <h3 className="font-medium mb-3 flex items-center gap-3">
        <span className="h-10 w-10 rounded-full bg-quantum-100 dark:bg-quantum-900/30 flex items-center justify-center">
          <Icon className="h-5 w-5 text-quantum-600 dark:text-quantum-400" />
        </span>
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
}
