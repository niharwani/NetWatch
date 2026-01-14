import net from "net";
import dns from "dns";
import { promisify } from "util";
import { TestResult, TestDetails } from "@/types/connectivity";

const dnsResolve4 = promisify(dns.resolve4);
const dnsResolve6 = promisify(dns.resolve6);
const dnsResolveMx = promisify(dns.resolveMx);
const dnsResolveTxt = promisify(dns.resolveTxt);
const dnsResolveCname = promisify(dns.resolveCname);

/**
 * TCP connection test
 */
export async function tcpTest(
  host: string,
  port: number,
  timeout: number = 5000
): Promise<TestResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
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
        success: true,
        responseTime,
        details: {
          connected: true,
        },
      });
    });

    socket.on("timeout", () => {
      cleanup();
      resolve({
        success: false,
        responseTime: timeout,
        error: "Connection timed out",
        details: {
          connected: false,
        },
      });
    });

    socket.on("error", (err: Error) => {
      cleanup();
      resolve({
        success: false,
        responseTime: Date.now() - startTime,
        error: err.message,
        details: {
          connected: false,
        },
      });
    });

    socket.connect(port, host);
  });
}

/**
 * HTTP/HTTPS endpoint test
 */
export async function httpTest(
  url: string,
  options: {
    method?: string;
    timeout?: number;
    followRedirects?: boolean;
  } = {}
): Promise<TestResult> {
  const { method = "GET", timeout = 10000, followRedirects = true } = options;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method,
      redirect: followRedirects ? "follow" : "manual",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    const details: TestDetails = {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };

    // Try to get content length
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      details.contentLength = parseInt(contentLength, 10);
    }

    return {
      success: response.ok,
      responseTime,
      details,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : "HTTP request failed",
    };
  }
}

/**
 * DNS resolution test
 */
export async function dnsTest(
  hostname: string,
  options: {
    recordType?: "A" | "AAAA" | "CNAME" | "MX" | "TXT";
    nameserver?: string;
  } = {}
): Promise<TestResult> {
  const { recordType = "A", nameserver } = options;
  const startTime = Date.now();

  // Set custom nameserver if provided
  if (nameserver) {
    dns.setServers([nameserver]);
  }

  try {
    let resolvedAddresses: string[] = [];

    switch (recordType) {
      case "A":
        resolvedAddresses = await dnsResolve4(hostname);
        break;
      case "AAAA":
        resolvedAddresses = await dnsResolve6(hostname);
        break;
      case "CNAME":
        resolvedAddresses = await dnsResolveCname(hostname);
        break;
      case "MX":
        const mxRecords = await dnsResolveMx(hostname);
        resolvedAddresses = mxRecords.map((r) => `${r.exchange} (priority: ${r.priority})`);
        break;
      case "TXT":
        const txtRecords = await dnsResolveTxt(hostname);
        resolvedAddresses = txtRecords.map((r) => r.join(""));
        break;
    }

    const responseTime = Date.now() - startTime;

    return {
      success: resolvedAddresses.length > 0,
      responseTime,
      details: {
        resolvedAddresses,
        nameserver: nameserver || dns.getServers()[0],
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : "DNS resolution failed",
      details: {
        nameserver: nameserver || dns.getServers()[0],
      },
    };
  }
}

/**
 * Check if a host is reachable via TCP
 */
export async function isHostReachable(
  host: string,
  port: number = 80,
  timeout: number = 5000
): Promise<boolean> {
  const result = await tcpTest(host, port, timeout);
  return result.success;
}

/**
 * Test multiple endpoints concurrently
 */
export async function testEndpoints(
  endpoints: Array<{ host: string; port: number }>
): Promise<Map<string, TestResult>> {
  const results = await Promise.all(
    endpoints.map(async ({ host, port }) => {
      const result = await tcpTest(host, port);
      return { key: `${host}:${port}`, result };
    })
  );

  const resultMap = new Map<string, TestResult>();
  results.forEach(({ key, result }) => {
    resultMap.set(key, result);
  });

  return resultMap;
}

/**
 * Comprehensive connectivity test suite
 */
export interface ConnectivitySuiteResult {
  tcp: TestResult | null;
  http: TestResult | null;
  dns: TestResult | null;
  overallSuccess: boolean;
  totalTime: number;
}

export async function runConnectivitySuite(
  host: string,
  options: {
    tcpPort?: number;
    httpUrl?: string;
    dnsHostname?: string;
  } = {}
): Promise<ConnectivitySuiteResult> {
  const startTime = Date.now();
  const { tcpPort = 80, httpUrl, dnsHostname } = options;

  const [tcpResult, httpResult, dnsResult] = await Promise.all([
    tcpTest(host, tcpPort),
    httpUrl ? httpTest(httpUrl) : Promise.resolve(null),
    dnsHostname ? dnsTest(dnsHostname) : Promise.resolve(null),
  ]);

  const totalTime = Date.now() - startTime;
  const overallSuccess =
    tcpResult.success &&
    (httpResult === null || httpResult.success) &&
    (dnsResult === null || dnsResult.success);

  return {
    tcp: tcpResult,
    http: httpResult,
    dns: dnsResult,
    overallSuccess,
    totalTime,
  };
}
