
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
  className?: string;
  status?: "operational" | "in-progress" | "planned";
}

export function ServiceCard({ 
  title, 
  description, 
  icon, 
  to, 
  className,
  status = "operational" 
}: ServiceCardProps) {
  const statusColors = {
    "operational": "bg-green-500",
    "in-progress": "bg-amber-500",
    "planned": "bg-blue-500"
  };
  
  const statusText = {
    "operational": "Operational",
    "in-progress": "In Progress",
    "planned": "Planned"
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-900 dark:border-gray-800",
      className
    )}>
      <div className="flex items-center space-x-4">
        <div className="rounded-md bg-quantum-50 p-3 dark:bg-quantum-900/20">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className="flex items-center mt-1">
            <span className={`h-2 w-2 rounded-full ${statusColors[status]} mr-2`}></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{statusText[status]}</span>
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
      
      <div className="mt-4">
        <Link
          to={to}
          className="inline-flex items-center text-sm font-medium text-quantum-600 hover:text-quantum-700 dark:text-quantum-400 dark:hover:text-quantum-300"
        >
          Learn more
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
