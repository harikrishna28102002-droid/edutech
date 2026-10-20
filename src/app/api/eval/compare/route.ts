import { NextRequest, NextResponse } from "next/server";
import {
  runBaseModelComparison,
  getLatestComparison,
  BASE_MODELS_MATRIX,
} from "@/lib/model-comparison";

export const dynamic = "force-dynamic";

// GET /api/eval/compare - Retrieve latest multi-model comparison results
export async function GET() {
  try {
    const comparison = await getLatestComparison();
    return NextResponse.json({
      success: true,
      availableModels: BASE_MODELS_MATRIX,
      comparison,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch model comparison results",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/eval/compare - Run comparison benchmark across models
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const selectedModelIds = body.selectedModelIds || BASE_MODELS_MATRIX.map((m) => m.id);
    const runSandboxTests = body.runSandboxTests !== false;

    const comparison = await runBaseModelComparison({
      selectedModelIds,
      runSandboxTests,
    });

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute model comparison",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
