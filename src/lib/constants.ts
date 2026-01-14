// Application constants
export const APP_NAME = "NetWatch";
export const APP_VERSION = "1.0.0";

// Monitoring intervals (in milliseconds)
export const PING_INTERVAL = 5000; // 5 seconds
export const METRICS_INTERVAL = 1000; // 1 second
export const DEVICE_HISTORY_LIMIT = 60; // Keep last 60 data points

// Alert thresholds
export const DEFAULT_LATENCY_THRESHOLD = 100; // ms
export const DEFAULT_PACKET_LOSS_THRESHOLD = 5; // percent
export const DEFAULT_PING_TIMEOUT = 2000; // ms
export const DEFAULT_SCAN_TIMEOUT = 1000; // ms

// Port scanning
export const MAX_CONCURRENT_SCANS = 50;
export const MAX_PORT_RANGE = 65535;

// Data retention
export const MAX_ALERT_HISTORY = 100;
export const MAX_SCAN_HISTORY = 20;
export const MAX_TEST_HISTORY = 50;

// UI Constants
export const STATUS_COLORS = {
  online: "bg-green-500",
  offline: "bg-red-500",
  warning: "bg-yellow-500",
  unknown: "bg-gray-500",
} as const;

export const SEVERITY_COLORS = {
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  critical: "bg-red-500",
} as const;

export const SEVERITY_TEXT_COLORS = {
  info: "text-blue-600",
  warning: "text-yellow-600",
  critical: "text-red-600",
} as const;

// Chart colors
export const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#22c55e",
  warning: "#eab308",
  danger: "#ef4444",
  muted: "#6b7280",
} as const;

// Navigation items
export const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { name: "Devices", href: "/devices", icon: "Monitor" },
  { name: "Port Scanner", href: "/scanner", icon: "Scan" },
  { name: "Tests", href: "/tests", icon: "TestTube" },
  { name: "Alerts", href: "/alerts", icon: "Bell" },
  { name: "Settings", href: "/settings", icon: "Settings" },
] as const;

// Storage keys
export const STORAGE_KEYS = {
  DEVICES: "netwatch_devices",
  ALERTS: "netwatch_alerts",
  SETTINGS: "netwatch_settings",
  THEME: "netwatch_theme",
  SCAN_HISTORY: "netwatch_scan_history",
  TEST_HISTORY: "netwatch_test_history",
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  pingInterval: PING_INTERVAL,
  latencyThreshold: DEFAULT_LATENCY_THRESHOLD,
  packetLossThreshold: DEFAULT_PACKET_LOSS_THRESHOLD,
  notificationsEnabled: true,
  soundEnabled: false,
  darkMode: false,
  autoRefresh: true,
} as const;
