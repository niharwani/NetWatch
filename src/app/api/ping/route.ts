import { NextRequest, NextResponse } from "next/server";
import { pingHost } from "@/lib/network/ping";
import { isValidIP } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, count = 4, timeout = 2000 } = body;

    // Validate IP
    if (!ip || !isValidIP(ip)) {
      return NextResponse.json(
        { error: "Invalid IP address or hostname" },
        { status: 400 }
      );
    }

    // Validate count
    if (count < 1 || count > 10) {
      return NextResponse.json(
        { error: "Count must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Validate timeout
    if (timeout < 500 || timeout > 10000) {
      return NextResponse.json(
        { error: "Timeout must be between 500ms and 10000ms" },
        { status: 400 }
      );
    }

    // Execute ping
    const result = await pingHost(ip, { count, timeout });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Ping API error:", error);
    return NextResponse.json(
      { error: "Failed to execute ping" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ip = searchParams.get("ip");

  if (!ip || !isValidIP(ip)) {
    return NextResponse.json(
      { error: "Invalid IP address or hostname" },
      { status: 400 }
    );
  }

  try {
    const result = await pingHost(ip, { count: 1, timeout: 2000 });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Ping API error:", error);
    return NextResponse.json(
      { error: "Failed to execute ping" },
      { status: 500 }
    );
  }
}
