"use client";

import {
  LineChart,
  Line,
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
  // Transform data to cumulative values (like stocks)
  let cumulativeUpload = 0;
  let cumulativeDownload = 0;

  const chartData = data.map((metric) => {
    cumulativeUpload += metric.uploadSpeed;
    cumulativeDownload += metric.downloadSpeed;

    return {
      time: new Date(metric.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      upload: cumulativeUpload,
      download: cumulativeDownload,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
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
          formatter={(value: number) => [formatBytes(value), ""]}
        />
        {showLegend && <Legend />}
        <Line
          type="linear"
          dataKey="upload"
          name="Upload"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="linear"
          dataKey="download"
          name="Download"
          stroke={CHART_COLORS.success}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
