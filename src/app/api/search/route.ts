import { NextRequest, NextResponse } from "next/server";
import { hybridSearch } from "@/lib/hybrid-search";

export const dynamic = "force-dynamic";

// GET /api/search?q=query&mode=hybrid&rerank=true&limit=10
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query");

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Query parameter 'q' is required." },
        { status: 400 }
      );
    }

    const mode = (searchParams.get("mode") as "hybrid" | "vector" | "keyword") || "hybrid";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const rerank = searchParams.get("rerank") !== "false";

    const response = await hybridSearch({
      query,
      mode,
      limit,
      rerank,
    });

    return NextResponse.json({ success: true, ...response });
  } catch (error: unknown) {
    console.error("Hybrid Search Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute hybrid search.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/search: { query: string, mode?: "hybrid" | "vector" | "keyword", limit?: number, rerank?: boolean }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body.query || body.q;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Field 'query' is required in request body." },
        { status: 400 }
      );
    }

    const mode = body.mode || "hybrid";
    const limit = typeof body.limit === "number" ? body.limit : 10;
    const rerank = body.rerank !== false;

    const response = await hybridSearch({
      query,
      mode,
      limit,
      rerank,
    });

    return NextResponse.json({ success: true, ...response });
  } catch (error: unknown) {
    console.error("Hybrid Search POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute search.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
