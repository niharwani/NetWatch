export interface NetworkMetric {
  timestamp: number;
  uploadSpeed: number;
  downloadSpeed: number;
  activeConnections: number;
  utilization: number;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  uptime: number;
}

export interface PerformanceMetric {
  timestamp: number;
  value: number;
  label?: string;
}

export interface MetricsSummary {
  currentUploadSpeed: number;
  currentDownloadSpeed: number;
  avgUploadSpeed: number;
  avgDownloadSpeed: number;
  maxUploadSpeed: number;
  maxDownloadSpeed: number;
  totalDataTransferred: number;
  activeConnections: number;
  avgUtilization: number;
}

export interface HealthScore {
  overall: number;
  latency: number;
  packetLoss: number;
  availability: number;
  components: HealthComponent[];
}

export interface HealthComponent {
  name: string;
  score: number;
  status: "healthy" | "degraded" | "critical";
  message?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  interval: "1m" | "5m" | "15m" | "1h" | "6h" | "24h";
}

export interface MetricsQuery {
  deviceId?: string;
  metric: string;
  timeRange: TimeRange;
  aggregation?: "avg" | "min" | "max" | "sum" | "count";
}
