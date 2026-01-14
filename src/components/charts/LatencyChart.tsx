"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { LatencyDataPoint } from "@/types/device";
import { CHART_COLORS } from "@/lib/constants";

interface LatencyChartProps {
  data: LatencyDataPoint[];
  height?: number;
  showThreshold?: boolean;
  threshold?: number;
}

export function LatencyChart({
  data,
  height = 200,
  showThreshold = false,
  threshold = 100,
}: LatencyChartProps) {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    latency: point.latency,
    status: point.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          domain={[0, "auto"]}
          className="text-muted-foreground"
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value) => {
            if (typeof value === "number") {
              return [`${value.toFixed(1)}ms`, "Latency"];
            }
            return ["N/A", "Latency"];
          }}
        />
        {showThreshold && (
          <ReferenceLine
            y={threshold}
            stroke={CHART_COLORS.warning}
            strokeDasharray="5 5"
            label={{
              value: `Threshold: ${threshold}ms`,
              position: "right",
              fill: CHART_COLORS.warning,
              fontSize: 10,
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="latency"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
