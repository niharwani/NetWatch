import { NetworkMetric, HealthScore, HealthComponent } from "@/types/metric";
import { Device } from "@/types/device";

/**
 * Generate simulated network metrics
 * In a production environment, this would read from actual network interfaces
 */
export function generateNetworkMetrics(): NetworkMetric {
  // Simulate realistic network metrics
  const baseUpload = 50 * 1024 * 1024; // 50 MB/s base
  const baseDownload = 100 * 1024 * 1024; // 100 MB/s base
  const variance = 0.3; // 30% variance

  return {
    timestamp: Date.now(),
    uploadSpeed: Math.round(baseUpload * (1 + (Math.random() - 0.5) * variance)),
    downloadSpeed: Math.round(baseDownload * (1 + (Math.random() - 0.5) * variance)),
    activeConnections: Math.floor(Math.random() * 50) + 10,
    utilization: Math.random() * 60 + 20, // 20-80% utilization
  };
}

/**
 * Calculate health score from devices
 */
export function calculateHealthScore(devices: Device[]): HealthScore {
  if (devices.length === 0) {
    return {
      overall: 100,
      latency: 100,
      packetLoss: 100,
      availability: 100,
      components: [],
    };
  }

  const components: HealthComponent[] = [];

  // Calculate availability score
  const onlineDevices = devices.filter((d) => d.status === "online").length;
  const availabilityScore = (onlineDevices / devices.length) * 100;
  components.push({
    name: "Availability",
    score: availabilityScore,
    status: availabilityScore >= 90 ? "healthy" : availabilityScore >= 70 ? "degraded" : "critical",
    message: `${onlineDevices}/${devices.length} devices online`,
  });

  // Calculate latency score (lower is better)
  const avgLatency =
    devices
      .filter((d) => d.avgLatency > 0)
      .reduce((sum, d) => sum + d.avgLatency, 0) /
    devices.filter((d) => d.avgLatency > 0).length || 0;

  // Score: 100 for <20ms, 0 for >200ms, linear interpolation
  const latencyScore = Math.max(0, Math.min(100, 100 - ((avgLatency - 20) / 180) * 100));
  components.push({
    name: "Latency",
    score: latencyScore,
    status: latencyScore >= 80 ? "healthy" : latencyScore >= 50 ? "degraded" : "critical",
    message: `Average latency: ${avgLatency.toFixed(1)}ms`,
  });

  // Calculate packet loss score
  const avgPacketLoss =
    devices.reduce((sum, d) => sum + d.packetLoss, 0) / devices.length;
  const packetLossScore = Math.max(0, 100 - avgPacketLoss * 10); // -10 points per 1% packet loss
  components.push({
    name: "Packet Loss",
    score: packetLossScore,
    status: packetLossScore >= 95 ? "healthy" : packetLossScore >= 80 ? "degraded" : "critical",
    message: `Average packet loss: ${avgPacketLoss.toFixed(1)}%`,
  });

  // Calculate overall score (weighted average)
  const overall =
    availabilityScore * 0.4 + latencyScore * 0.35 + packetLossScore * 0.25;

  return {
    overall: Math.round(overall),
    latency: Math.round(latencyScore),
    packetLoss: Math.round(packetLossScore),
    availability: Math.round(availabilityScore),
    components,
  };
}

/**
 * Aggregate metrics over a time period
 */
export function aggregateMetrics(
  metrics: NetworkMetric[],
  aggregation: "avg" | "min" | "max" | "sum" = "avg"
): NetworkMetric | null {
  if (metrics.length === 0) return null;

  const aggregate = (values: number[]): number => {
    switch (aggregation) {
      case "avg":
        return values.reduce((a, b) => a + b, 0) / values.length;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
      case "sum":
        return values.reduce((a, b) => a + b, 0);
    }
  };

  return {
    timestamp: metrics[metrics.length - 1].timestamp,
    uploadSpeed: aggregate(metrics.map((m) => m.uploadSpeed)),
    downloadSpeed: aggregate(metrics.map((m) => m.downloadSpeed)),
    activeConnections: Math.round(aggregate(metrics.map((m) => m.activeConnections))),
    utilization: aggregate(metrics.map((m) => m.utilization)),
  };
}

/**
 * Detect performance anomalies
 */
export interface Anomaly {
  metric: string;
  value: number;
  threshold: number;
  severity: "warning" | "critical";
  message: string;
}

export function detectAnomalies(
  metrics: NetworkMetric[],
  thresholds: {
    highLatency?: number;
    lowSpeed?: number;
    highUtilization?: number;
  } = {}
): Anomaly[] {
  const {
    highLatency = 100,
    lowSpeed = 10 * 1024 * 1024, // 10 MB/s
    highUtilization = 90,
  } = thresholds;

  const anomalies: Anomaly[] = [];
  const latest = metrics[metrics.length - 1];

  if (!latest) return anomalies;

  if (latest.utilization > highUtilization) {
    anomalies.push({
      metric: "utilization",
      value: latest.utilization,
      threshold: highUtilization,
      severity: latest.utilization > 95 ? "critical" : "warning",
      message: `Network utilization is ${latest.utilization.toFixed(1)}%`,
    });
  }

  if (latest.downloadSpeed < lowSpeed) {
    anomalies.push({
      metric: "downloadSpeed",
      value: latest.downloadSpeed,
      threshold: lowSpeed,
      severity: latest.downloadSpeed < lowSpeed / 2 ? "critical" : "warning",
      message: `Download speed is below threshold`,
    });
  }

  if (latest.uploadSpeed < lowSpeed) {
    anomalies.push({
      metric: "uploadSpeed",
      value: latest.uploadSpeed,
      threshold: lowSpeed,
      severity: latest.uploadSpeed < lowSpeed / 2 ? "critical" : "warning",
      message: `Upload speed is below threshold`,
    });
  }

  return anomalies;
}
