import { NextResponse } from "next/server";
import { collectPlatformMetrics } from "@/lib/metrics-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const metrics = await collectPlatformMetrics();

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to collect platform metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
