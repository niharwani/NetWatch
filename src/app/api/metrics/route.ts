import { NextResponse } from "next/server";
import { generateNetworkMetrics } from "@/lib/network/metrics";

// Disable caching for real-time metrics
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Generate current metrics only - history is managed client-side
    // This works reliably on serverless platforms like Vercel
    const currentMetrics = generateNetworkMetrics();

    const response = NextResponse.json({
      success: true,
      data: {
        current: currentMetrics,
      },
    });

    // Prevent caching to ensure fresh data on each request
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
