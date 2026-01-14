import { NextRequest } from "next/server";
import { generateNetworkMetrics } from "@/lib/network/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data immediately
      const initialMetrics = generateNetworkMetrics();
      const initialData = `data: ${JSON.stringify({
        type: "metrics",
        data: initialMetrics,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initialData));

      // Set up interval for updates
      const interval = setInterval(() => {
        try {
          const metrics = generateNetworkMetrics();
          const data = `data: ${JSON.stringify({
            type: "metrics",
            data: metrics,
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error("Error sending SSE data:", error);
        }
      }, 1000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
