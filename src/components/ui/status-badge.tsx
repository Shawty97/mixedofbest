
import { cn } from "@/lib/utils";

export type StatusType = "success" | "warning" | "error" | "info" | "pending" | "active";

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ 
  status, 
  text,
  className,
  size = "md"
}: StatusBadgeProps) {
  const statusConfig = {
    success: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-400",
      border: "border-green-200 dark:border-green-800/30",
      defaultText: "Success"
    },
    warning: {
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      text: "text-yellow-800 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-800/30",
      defaultText: "Warning"
    },
    error: {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-400",
      border: "border-red-200 dark:border-red-800/30",
      defaultText: "Error"
    },
    info: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800/30",
      defaultText: "Info"
    },
    pending: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-800 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-700",
      defaultText: "Pending"
    },
    active: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      text: "text-purple-800 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800/30",
      defaultText: "Active"
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1"
  };

  const config = statusConfig[status] || statusConfig.info;
  const displayText = text || config.defaultText;
  
  // Safely create a dot color class by replacing "text-" with "bg-" in the text color class
  const dotColorClass = config.text.split(' ')[0].replace('text-', 'bg-');

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColorClass}`}></span>
      {displayText}
    </span>
  );
}
