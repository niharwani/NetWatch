import { NextResponse } from "next/server";
import { generateNetworkMetrics } from "@/lib/network/metrics";

// In-memory metrics store (would be replaced by a proper database in production)
const metricsHistory: ReturnType<typeof generateNetworkMetrics>[] = [];
const MAX_HISTORY = 60; // Keep last 60 seconds

export async function GET() {
  try {
    // Generate current metrics
    const currentMetrics = generateNetworkMetrics();

    // Add to history
    metricsHistory.push(currentMetrics);
    if (metricsHistory.length > MAX_HISTORY) {
      metricsHistory.shift();
    }

    // Calculate summary
    const avgUploadSpeed =
      metricsHistory.reduce((sum, m) => sum + m.uploadSpeed, 0) / metricsHistory.length;
    const avgDownloadSpeed =
      metricsHistory.reduce((sum, m) => sum + m.downloadSpeed, 0) / metricsHistory.length;
    const maxUploadSpeed = Math.max(...metricsHistory.map((m) => m.uploadSpeed));
    const maxDownloadSpeed = Math.max(...metricsHistory.map((m) => m.downloadSpeed));
    const avgUtilization =
      metricsHistory.reduce((sum, m) => sum + m.utilization, 0) / metricsHistory.length;

    return NextResponse.json({
      success: true,
      data: {
        current: currentMetrics,
        history: metricsHistory.slice(-30), // Return last 30 data points
        summary: {
          currentUploadSpeed: currentMetrics.uploadSpeed,
          currentDownloadSpeed: currentMetrics.downloadSpeed,
          avgUploadSpeed,
          avgDownloadSpeed,
          maxUploadSpeed,
          maxDownloadSpeed,
          totalDataTransferred: metricsHistory.reduce(
            (sum, m) => sum + m.uploadSpeed + m.downloadSpeed,
            0
          ),
          activeConnections: currentMetrics.activeConnections,
          avgUtilization,
        },
      },
    });
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
