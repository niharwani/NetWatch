export type TestType = "ping" | "tcp" | "http" | "dns";

export type TestStatus = "pending" | "running" | "success" | "failure" | "timeout";

export interface ConnectivityTest {
  id: string;
  type: TestType;
  target: string;
  port?: number;
  timestamp: Date;
  status: TestStatus;
  responseTime?: number;
  error?: string;
  details?: TestDetails;
}

export interface TestDetails {
  // For HTTP tests
  statusCode?: number;
  contentLength?: number;
  headers?: Record<string, string>;

  // For DNS tests
  resolvedAddresses?: string[];
  nameserver?: string;

  // For TCP tests
  connected?: boolean;
  banner?: string;

  // For ping tests
  ttl?: number;
  packetsSent?: number;
  packetsReceived?: number;
  packetLoss?: number;
  minLatency?: number;
  maxLatency?: number;
  avgLatency?: number;
}

export interface PingTestRequest {
  host: string;
  count?: number;
  timeout?: number;
}

export interface TcpTestRequest {
  host: string;
  port: number;
  timeout?: number;
}

export interface HttpTestRequest {
  url: string;
  method?: "GET" | "POST" | "HEAD";
  timeout?: number;
  followRedirects?: boolean;
}

export interface DnsTestRequest {
  hostname: string;
  recordType?: "A" | "AAAA" | "CNAME" | "MX" | "TXT";
  nameserver?: string;
}

export interface TestResult {
  success: boolean;
  responseTime: number;
  error?: string;
  details?: TestDetails;
}

export interface TestHistory {
  testId: string;
  results: ConnectivityTest[];
  avgResponseTime: number;
  successRate: number;
  lastRun: Date;
}
