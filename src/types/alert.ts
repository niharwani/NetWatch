export type AlertSeverity = "info" | "warning" | "critical";

export type AlertType =
  | "latency"
  | "packet_loss"
  | "offline"
  | "port_change"
  | "connectivity"
  | "threshold";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  message: string;
  deviceId?: string;
  deviceName?: string;
  timestamp: Date;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  type: AlertType;
  condition: AlertCondition;
  severity: AlertSeverity;
  deviceIds?: string[]; // Empty means all devices
}

export interface AlertCondition {
  metric: "latency" | "packetLoss" | "status" | "port";
  operator: "gt" | "lt" | "eq" | "neq" | "gte" | "lte";
  value: number | string;
  duration?: number; // How long condition must be true (in seconds)
}

export interface AlertSummary {
  total: number;
  info: number;
  warning: number;
  critical: number;
  unacknowledged: number;
}

export interface AlertCreateInput {
  severity: AlertSeverity;
  type: AlertType;
  message: string;
  deviceId?: string;
  deviceName?: string;
  metadata?: Record<string, unknown>;
}
