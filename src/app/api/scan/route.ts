import { NextRequest, NextResponse } from "next/server";
import {
  scanPorts,
  getQuickScanPorts,
  getCommonPorts,
  generatePortRange,
  calculateScanSummary,
} from "@/lib/network/scanner";
import { isValidIP, isValidPort, generateId } from "@/lib/utils";
import { ScanType } from "@/types/scan";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ip,
      ports,
      startPort,
      endPort,
      scanType = "quick",
      timeout = 1000,
    } = body as {
      ip: string;
      ports?: number[];
      startPort?: number;
      endPort?: number;
      scanType?: ScanType;
      timeout?: number;
    };

    // Validate IP
    if (!ip || !isValidIP(ip)) {
      return NextResponse.json(
        { error: "Invalid IP address or hostname" },
        { status: 400 }
      );
    }

    // Validate timeout
    if (timeout < 100 || timeout > 5000) {
      return NextResponse.json(
        { error: "Timeout must be between 100ms and 5000ms" },
        { status: 400 }
      );
    }

    // Determine which ports to scan
    let portsToScan: number[];

    if (ports && Array.isArray(ports)) {
      // Custom ports provided
      if (ports.some((p) => !isValidPort(p))) {
        return NextResponse.json(
          { error: "Invalid port number(s) provided" },
          { status: 400 }
        );
      }
      portsToScan = ports;
    } else if (startPort !== undefined && endPort !== undefined) {
      // Port range provided
      if (!isValidPort(startPort) || !isValidPort(endPort)) {
        return NextResponse.json(
          { error: "Invalid port range" },
          { status: 400 }
        );
      }
      if (endPort - startPort > 1000) {
        return NextResponse.json(
          { error: "Port range cannot exceed 1000 ports per scan" },
          { status: 400 }
        );
      }
      portsToScan = generatePortRange(startPort, endPort);
    } else {
      // Use scan type presets
      switch (scanType) {
        case "quick":
          portsToScan = getQuickScanPorts();
          break;
        case "common":
          portsToScan = getCommonPorts();
          break;
        case "full":
          // Full scan is limited to first 1024 ports for safety
          portsToScan = generatePortRange(1, 1024);
          break;
        default:
          portsToScan = getQuickScanPorts();
      }
    }

    const startTime = Date.now();

    // Execute scan
    const results = await scanPorts(ip, portsToScan, {
      timeout,
      concurrency: 50,
    });

    const duration = Date.now() - startTime;
    const summary = calculateScanSummary(results, duration);

    return NextResponse.json({
      success: true,
      data: {
        id: generateId(),
        ip,
        timestamp: new Date().toISOString(),
        ports: results,
        ...summary,
      },
    });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json(
      { error: "Failed to execute port scan" },
      { status: 500 }
    );
  }
}
