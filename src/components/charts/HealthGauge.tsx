"use client";

import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
}

export function HealthGauge({
  score,
  size = "md",
  showLabel = true,
  label = "Health Score",
}: HealthGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  const getColor = (value: number) => {
    if (value >= 90) return "text-green-500";
    if (value >= 70) return "text-yellow-500";
    if (value >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const getStrokeColor = (value: number) => {
    if (value >= 90) return "#22c55e";
    if (value >= 70) return "#eab308";
    if (value >= 50) return "#f97316";
    return "#ef4444";
  };

  const sizeConfig = {
    sm: { size: 80, strokeWidth: 6, fontSize: "text-lg" },
    md: { size: 120, strokeWidth: 8, fontSize: "text-2xl" },
    lg: { size: 160, strokeWidth: 10, fontSize: "text-4xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          className="transform -rotate-90"
          width={config.size}
          height={config.size}
        >
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor(clampedScore)}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        {/* Score text */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold",
            config.fontSize,
            getColor(clampedScore)
          )}
        >
          {Math.round(clampedScore)}
        </div>
      </div>
      {showLabel && (
        <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
