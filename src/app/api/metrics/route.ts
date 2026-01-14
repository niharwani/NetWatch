import { NextResponse } from "next/server";
import { generateNetworkMetrics } from "@/lib/network/metrics";

export async function GET() {
  try {
    // Generate current metrics only - history is managed client-side
    // This works reliably on serverless platforms like Vercel
    const currentMetrics = generateNetworkMetrics();

    return NextResponse.json({
      success: true,
      data: {
        current: currentMetrics,
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
