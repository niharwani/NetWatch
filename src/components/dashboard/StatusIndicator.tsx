import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "offline" | "warning" | "unknown";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  label?: string;
}

export function StatusIndicator({
  status,
  size = "md",
  pulse = true,
  label,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-red-500",
    warning: "bg-yellow-500",
    unknown: "bg-gray-500",
  };

  const statusLabels = {
    online: "Online",
    offline: "Offline",
    warning: "Warning",
    unknown: "Unknown",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex">
        <span
          className={cn(
            "rounded-full",
            sizeClasses[size],
            statusColors[status],
            pulse && status === "online" && "animate-pulse"
          )}
        />
        {pulse && status === "online" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              statusColors[status]
            )}
          />
        )}
      </span>
      {label !== undefined ? (
        <span className="text-sm">{label}</span>
      ) : (
        <span className="text-sm capitalize">{statusLabels[status]}</span>
      )}
    </div>
  );
}
