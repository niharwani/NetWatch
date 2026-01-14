import net from "net";
import { COMMON_PORTS, PortResult, PortStatus } from "@/types/scan";

export interface ScanOptions {
  timeout?: number;
  concurrency?: number;
}

/**
 * Scan a single port on a host
 */
export async function scanPort(
  host: string,
  port: number,
  timeout: number = 1000
): Promise<PortResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
      }
    };

    socket.setTimeout(timeout);

    socket.on("connect", () => {
      const responseTime = Date.now() - startTime;
      cleanup();
      resolve({
        port,
        status: "open",
        service: getServiceName(port),
        responseTime,
      });
    });

    socket.on("timeout", () => {
      cleanup();
      resolve({
        port,
        status: "filtered",
        service: getServiceName(port),
        responseTime: timeout,
      });
    });

    socket.on("error", (err: NodeJS.ErrnoException) => {
      cleanup();
      // ECONNREFUSED means port is closed but reachable
      // Other errors (ETIMEDOUT, EHOSTUNREACH) indicate filtered
      const status: PortStatus = err.code === "ECONNREFUSED" ? "closed" : "filtered";
      resolve({
        port,
        status,
        service: getServiceName(port),
        responseTime: Date.now() - startTime,
      });
    });

    try {
      socket.connect(port, host);
    } catch {
      cleanup();
      resolve({
        port,
        status: "filtered",
        service: getServiceName(port),
        responseTime: Date.now() - startTime,
      });
    }
  });
}

/**
 * Scan multiple ports on a host with concurrency control
 */
export async function scanPorts(
  host: string,
  ports: number[],
  options: ScanOptions = {}
): Promise<PortResult[]> {
  const { timeout = 1000, concurrency = 50 } = options;
  const results: PortResult[] = [];

  // Process ports in batches for concurrency control
  for (let i = 0; i < ports.length; i += concurrency) {
    const batch = ports.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((port) => scanPort(host, port, timeout))
    );
    results.push(...batchResults);
  }

  // Sort by port number
  return results.sort((a, b) => a.port - b.port);
}

/**
 * Get the service name for a well-known port
 */
export function getServiceName(port: number): string {
  return COMMON_PORTS[port] || "Unknown";
}

/**
 * Generate an array of port numbers for a range
 */
export function generatePortRange(start: number, end: number): number[] {
  const ports: number[] = [];
  for (let port = start; port <= end; port++) {
    ports.push(port);
  }
  return ports;
}

/**
 * Get commonly scanned ports (top 20)
 */
export function getQuickScanPorts(): number[] {
  return [
    21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1723,
    3306, 3389, 5900, 8080,
  ];
}

/**
 * Get extended common ports (top 100)
 */
export function getCommonPorts(): number[] {
  return [
    20, 21, 22, 23, 25, 26, 37, 53, 67, 68, 69, 79, 80, 81, 82, 88, 100, 110,
    111, 113, 119, 123, 135, 137, 138, 139, 143, 161, 162, 177, 179, 199, 201,
    264, 389, 427, 443, 444, 445, 464, 465, 497, 500, 502, 512, 513, 514, 515,
    520, 523, 530, 543, 544, 548, 554, 587, 593, 623, 631, 636, 639, 666, 771,
    789, 873, 902, 993, 995, 1000, 1010, 1024, 1025, 1026, 1027, 1028, 1029,
    1030, 1080, 1099, 1194, 1433, 1434, 1521, 1701, 1720, 1723, 1755, 1883,
    1900, 2000, 2049, 2082, 2083, 2086, 2087, 2095, 2096, 2222, 2323,
  ];
}

/**
 * Scan summary statistics
 */
export interface ScanSummary {
  totalPorts: number;
  openPorts: number;
  closedPorts: number;
  filteredPorts: number;
  duration: number;
}

/**
 * Calculate scan summary from results
 */
export function calculateScanSummary(
  results: PortResult[],
  duration: number
): ScanSummary {
  return {
    totalPorts: results.length,
    openPorts: results.filter((r) => r.status === "open").length,
    closedPorts: results.filter((r) => r.status === "closed").length,
    filteredPorts: results.filter((r) => r.status === "filtered").length,
    duration,
  };
}
