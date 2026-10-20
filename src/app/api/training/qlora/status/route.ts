import { NextResponse } from "next/server";
import { getLatestQLoRARun, getAllQLoRARuns, executeQLoRATraining } from "@/lib/qlora-trainer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let latest = getLatestQLoRARun();
    if (!latest) {
      // Auto-run baseline initial QLoRA run if none exists
      latest = await executeQLoRATraining();
    }

    const history = getAllQLoRARuns();

    return NextResponse.json({
      success: true,
      currentRun: latest,
      historyCount: history.length,
      history,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve QLoRA training status",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
