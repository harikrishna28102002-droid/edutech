import { NextResponse } from "next/server";
import { listTrainingDatasets } from "@/lib/training-generator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const datasets = await listTrainingDatasets();
    return NextResponse.json({
      success: true,
      totalDatasets: datasets.length,
      datasets,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to list training datasets",
        details: err instanceof Error ? err.message : "Unknown error",
        datasets: [],
      },
      { status: 500 }
    );
  }
}
