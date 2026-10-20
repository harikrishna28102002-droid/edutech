import { NextRequest, NextResponse } from "next/server";
import { executeQLoRATraining } from "@/lib/qlora-trainer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const baseModel = body.baseModel || "meta-llama/Meta-Llama-3-8B-Instruct";
    const loraRank = Number(body.loraRank) || 16;
    const loraAlpha = Number(body.loraAlpha) || 32;
    const learningRate = Number(body.learningRate) || 0.0002;
    const epochs = Number(body.epochs) || 3;
    const maxSteps = Number(body.maxSteps) || 25;

    const summary = await executeQLoRATraining({
      baseModel,
      loraRank,
      loraAlpha,
      learningRate,
      epochs,
      maxSteps,
    });

    return NextResponse.json({
      success: true,
      run: summary,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute QLoRA training",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
