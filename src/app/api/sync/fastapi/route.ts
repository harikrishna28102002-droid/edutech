import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncFastApiDocs } from "@/lib/fastapi-sync";

export const dynamic = "force-dynamic";

// GET /api/sync/fastapi: Inspect sync status and logs
export async function GET() {
  try {
    const source = await prisma.docSource.findUnique({
      where: { name: "FastAPI Official Documentation" },
      include: {
        syncLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { pages: true },
        },
      },
    });

    if (!source) {
      return NextResponse.json({
        initialized: false,
        status: "NOT_INITIALIZED",
        message: "FastAPI documentation has not been synced yet. Send a POST request to initiate sync.",
        repo: "tiangolo/fastapi",
        pagesCount: 0,
        lastSyncAt: null,
      });
    }

    return NextResponse.json({
      initialized: true,
      id: source.id,
      name: source.name,
      repo: source.repo,
      branch: source.branch,
      lastCommitSha: source.lastCommitSha,
      lastSyncAt: source.lastSyncAt,
      syncStatus: source.syncStatus,
      syncError: source.syncError,
      pagesCount: source._count.pages,
      recentLogs: source.syncLogs,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to query FastAPI sync status. Check database connection.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/sync/fastapi: Trigger documentation sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const force = body.force === true || searchParams.get("force") === "true";

    const result = await syncFastApiDocs({ force });

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: result.message,
      commitSha: result.commitSha,
      stats: {
        added: result.addedCount,
        updated: result.updatedCount,
        unchanged: result.unchangedCount,
        total: result.totalCount,
        durationMs: result.durationMs,
      },
    });
  } catch (error: unknown) {
    console.error("FastAPI Sync Error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        message: "Failed to synchronize FastAPI documentation from GitHub.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
