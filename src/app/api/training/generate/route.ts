import { NextRequest, NextResponse } from "next/server";
import { generateTrainingDataset, DatasetFormat } from "@/lib/training-generator";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = body.name;
    const format = (body.format || "ALPACA") as DatasetFormat;
    const trainRatio = typeof body.trainRatio === "number" ? body.trainRatio : 0.8;
    const valRatio = typeof body.valRatio === "number" ? body.valRatio : 0.1;
    const testRatio = typeof body.testRatio === "number" ? body.testRatio : 0.1;
    const maxSamples = typeof body.maxSamples === "number" ? body.maxSamples : 50;

    const dataset = await generateTrainingDataset({
      name,
      format,
      trainRatio,
      valRatio,
      testRatio,
      maxSamples,
    });

    return NextResponse.json({
      success: true,
      dataset,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate training dataset from doc chunks",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
