import { NextRequest, NextResponse } from "next/server";
import {
  listTrainingDatasets,
  serializeDataset,
  DatasetFormat,
  DataSplit,
} from "@/lib/training-generator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get("datasetId");
    const requestedFormat = (searchParams.get("format") || "").toUpperCase() as DatasetFormat;
    const splitFilter = (searchParams.get("split") || "ALL").toUpperCase();
    const outputType = (searchParams.get("type") || "jsonl").toLowerCase() as "json" | "jsonl";

    const datasets = await listTrainingDatasets();
    const dataset = datasetId ? datasets.find((d) => d.id === datasetId) : datasets[0];

    if (!dataset) {
      return NextResponse.json({ error: "No training dataset found" }, { status: 404 });
    }

    const effectiveFormat: DatasetFormat =
      requestedFormat && ["ALPACA", "CHATML", "DPO", "RETRIEVAL_TRIPLET"].includes(requestedFormat)
        ? requestedFormat
        : dataset.format;

    let samples = dataset.samples;
    if (splitFilter !== "ALL" && ["TRAIN", "VALIDATION", "TEST"].includes(splitFilter)) {
      samples = samples.filter((s) => s.split === (splitFilter as DataSplit));
    }

    const fileContent = serializeDataset(samples, effectiveFormat, outputType);
    const filename = `${dataset.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${effectiveFormat.toLowerCase()}_${splitFilter.toLowerCase()}.${outputType}`;

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": outputType === "jsonl" ? "application/x-ndjson" : "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Export failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
