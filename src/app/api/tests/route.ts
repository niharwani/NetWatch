import { NextRequest, NextResponse } from "next/server";
import { tcpTest, httpTest, dnsTest } from "@/lib/network/connectivity";
import { pingHost } from "@/lib/network/ping";
import { isValidIP, generateId } from "@/lib/utils";
import { TestType } from "@/types/connectivity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, target, port, options = {} } = body as {
      type: TestType;
      target: string;
      port?: number;
      options?: Record<string, unknown>;
    };

    // Validate type
    if (!["ping", "tcp", "http", "dns"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid test type. Must be: ping, tcp, http, or dns" },
        { status: 400 }
      );
    }

    // Validate target
    if (!target) {
      return NextResponse.json(
        { error: "Target is required" },
        { status: 400 }
      );
    }

    let result;
    const testId = generateId();
    const timestamp = new Date();

    switch (type) {
      case "ping":
        if (!isValidIP(target)) {
          return NextResponse.json(
            { error: "Invalid IP address or hostname for ping test" },
            { status: 400 }
          );
        }
        const pingResult = await pingHost(target, {
          count: (options.count as number) || 4,
          timeout: (options.timeout as number) || 2000,
        });
        result = {
          success: pingResult.alive,
          responseTime: pingResult.time || 0,
          details: {
            ttl: undefined,
            packetsSent: (options.count as number) || 4,
            packetsReceived: pingResult.times.length,
            packetLoss: pingResult.packetLoss,
            minLatency: pingResult.minTime,
            maxLatency: pingResult.maxTime,
            avgLatency: pingResult.avgTime,
          },
          error: pingResult.error,
        };
        break;

      case "tcp":
        if (!isValidIP(target)) {
          return NextResponse.json(
            { error: "Invalid IP address or hostname for TCP test" },
            { status: 400 }
          );
        }
        if (!port || port < 1 || port > 65535) {
          return NextResponse.json(
            { error: "Valid port (1-65535) is required for TCP test" },
            { status: 400 }
          );
        }
        result = await tcpTest(target, port, (options.timeout as number) || 5000);
        break;

      case "http":
        // Validate URL
        try {
          new URL(target);
        } catch {
          return NextResponse.json(
            { error: "Invalid URL for HTTP test" },
            { status: 400 }
          );
        }
        result = await httpTest(target, {
          method: (options.method as string) || "GET",
          timeout: (options.timeout as number) || 10000,
          followRedirects: (options.followRedirects as boolean) ?? true,
        });
        break;

      case "dns":
        result = await dnsTest(target, {
          recordType: (options.recordType as "A" | "AAAA" | "CNAME" | "MX" | "TXT") || "A",
          nameserver: options.nameserver as string,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid test type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: testId,
        type,
        target,
        port,
        timestamp: timestamp.toISOString(),
        status: result.success ? "success" : "failure",
        responseTime: result.responseTime,
        error: result.error,
        details: result.details,
      },
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { error: "Failed to execute connectivity test" },
      { status: 500 }
    );
  }
}
