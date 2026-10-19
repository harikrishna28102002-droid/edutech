import { NextResponse } from "next/server";
import { embedAllDocPages } from "@/lib/embed-service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const stats = await embedAllDocPages();

    return NextResponse.json({
      success: true,
      message: `Successfully processed and embedded ${stats.chunksCreated} chunks across ${stats.pagesProcessed} documentation pages.`,
      stats,
    });
  } catch (error: unknown) {
    console.error("Embedding Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to chunk and embed documents.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
