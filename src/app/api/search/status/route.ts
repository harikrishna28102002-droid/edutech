import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EMBEDDING_DIMENSION } from "@/lib/embeddings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [chunksCount, pagesCount] = await Promise.all([
      prisma.docChunk.count(),
      prisma.docPage.count(),
    ]);

    const latestChunk = await prisma.docChunk.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    return NextResponse.json({
      success: true,
      status: chunksCount > 0 ? "READY" : "NEEDS_EMBEDDING",
      dimension: EMBEDDING_DIMENSION,
      totalChunks: chunksCount,
      totalPages: pagesCount,
      lastEmbeddedAt: latestChunk ? latestChunk.createdAt : null,
      provider: process.env.OPENAI_API_KEY ? "OpenAI text-embedding-3-small" : "Deterministic Semantic Projection (384-Dim)",
      algorithms: {
        dense: "Cosine Similarity (L2 Normalized)",
        sparse: "Okapi BM25 (k1=1.5, b=0.75)",
        fusion: "Reciprocal Rank Fusion (RRF, k=60)",
        reranking: "Contextual Cross-Score Reranking with Exact Phrase & Heading Alignment",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch search status.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
