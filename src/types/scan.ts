export type PortStatus = "open" | "closed" | "filtered";

export interface PortResult {
  port: number;
  status: PortStatus;
  service?: string;
  responseTime?: number;
  banner?: string;
}

export interface ScanResult {
  id: string;
  ip: string;
  timestamp: Date;
  ports: PortResult[];
  duration: number;
  totalPorts: number;
  openPorts: number;
  closedPorts: number;
  filteredPorts: number;
}

export interface ScanRequest {
  ip: string;
  ports?: number[];
  startPort?: number;
  endPort?: number;
  scanType?: ScanType;
  timeout?: number;
}

export type ScanType = "quick" | "common" | "full" | "custom";

export interface ScanProgress {
  id: string;
  status: "pending" | "scanning" | "completed" | "error";
  progress: number;
  currentPort?: number;
  totalPorts: number;
  startTime: Date;
  estimatedTimeRemaining?: number;
}

// Common port definitions
export const COMMON_PORTS: Record<number, string> = {
  20: "FTP Data",
  21: "FTP Control",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  67: "DHCP Server",
  68: "DHCP Client",
  69: "TFTP",
  80: "HTTP",
  110: "POP3",
  119: "NNTP",
  123: "NTP",
  135: "MS RPC",
  137: "NetBIOS Name",
  138: "NetBIOS Datagram",
  139: "NetBIOS Session",
  143: "IMAP",
  161: "SNMP",
  162: "SNMP Trap",
  389: "LDAP",
  443: "HTTPS",
  445: "Microsoft-DS",
  465: "SMTPS",
  514: "Syslog",
  587: "SMTP Submission",
  636: "LDAPS",
  993: "IMAPS",
  995: "POP3S",
  1433: "MS SQL",
  1434: "MS SQL Monitor",
  1521: "Oracle DB",
  1723: "PPTP",
  3306: "MySQL",
  3389: "RDP",
  5432: "PostgreSQL",
  5900: "VNC",
  5901: "VNC-1",
  6379: "Redis",
  8080: "HTTP Proxy",
  8443: "HTTPS Alt",
  27017: "MongoDB",
};

// Quick scan ports (top 100 most common)
export const QUICK_SCAN_PORTS = [
  21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1723,
  3306, 3389, 5900, 8080,
];

// Common ports (1-1024)
export const COMMON_PORT_RANGE = { start: 1, end: 1024 };
