export interface Device {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline" | "warning";
  latency: number | null;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  packetLoss: number;
  uptime: number;
  lastSeen: Date;
  history: LatencyDataPoint[];
  createdAt: Date;
}

export interface LatencyDataPoint {
  timestamp: number;
  latency: number | null;
  status: "success" | "timeout";
}

export interface DeviceCreateInput {
  name: string;
  ip: string;
}

export interface DeviceUpdateInput {
  name?: string;
  ip?: string;
  status?: "online" | "offline" | "warning";
  latency?: number | null;
  avgLatency?: number;
  minLatency?: number;
  maxLatency?: number;
  packetLoss?: number;
  uptime?: number;
  lastSeen?: Date;
  history?: LatencyDataPoint[];
}

export interface DeviceSummary {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  warningDevices: number;
  averageLatency: number;
  averagePacketLoss: number;
}
