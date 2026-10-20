import { NextRequest, NextResponse } from "next/server";
import { getDailySyncStatus, runDailySync } from "@/lib/daily-sync";

export const dynamic = "force-dynamic";

// GET /api/sync/daily - Inspect automated daily sync status and audit logs
export async function GET() {
  try {
    const telemetry = await getDailySyncStatus();

    return NextResponse.json({
      success: true,
      telemetry,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to query daily sync telemetry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/sync/daily - Trigger automated daily sync execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);

    const force = body.force === true || searchParams.get("force") === "true";
    const reembed = body.reembed !== false && searchParams.get("reembed") !== "false";

    const result = await runDailySync({ force, reembed });

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: result.message,
      commitSha: result.commitSha,
      durationMs: result.durationMs,
      stats: result.stats,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute daily sync pipeline",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
