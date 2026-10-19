import { NextRequest, NextResponse } from "next/server";
import { runEvaluationSuite } from "@/lib/eval-runner";

export const dynamic = "force-dynamic";

// POST /api/eval/run: Run the evaluation benchmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const modelProvider = body.modelProvider || "local";
    const runSandboxTests = body.runSandboxTests !== false;

    const summary = await runEvaluationSuite({
      modelProvider,
      runSandboxTests,
    });

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error: unknown) {
    console.error("Evaluation Run Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute evaluation suite.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
