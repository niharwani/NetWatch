"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { NetworkMetric } from "@/types/metric";
import { formatBytes } from "@/lib/utils";

interface NetworkChartProps {
  data: NetworkMetric[];
  height?: number;
  showLegend?: boolean;
}

export function NetworkChart({
  data,
  height = 300,
  showLegend = true,
}: NetworkChartProps) {
  const chartData = data.map((metric) => ({
    time: new Date(metric.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    upload: metric.uploadSpeed,
    download: metric.downloadSpeed,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#6b7280" }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#6b7280" }}
          tickFormatter={(value) => formatBytes(value)}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number) => [formatBytes(value) + "/s", ""]}
        />
        {showLegend && <Legend />}
        <Area
          type="monotone"
          dataKey="upload"
          name="Upload"
          stroke="#3b82f6"
          fill="url(#uploadGradient)"
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="download"
          name="Download"
          stroke="#22c55e"
          fill="url(#downloadGradient)"
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
