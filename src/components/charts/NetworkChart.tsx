"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { NetworkMetric } from "@/types/metric";
import { formatBytes } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";

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
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => formatBytes(value)}
          className="text-muted-foreground"
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
          stroke={CHART_COLORS.primary}
          fill="url(#uploadGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="download"
          name="Download"
          stroke={CHART_COLORS.success}
          fill="url(#downloadGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
