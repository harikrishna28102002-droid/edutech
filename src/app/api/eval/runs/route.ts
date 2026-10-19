import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const runs = await prisma.evalRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        benchmark: { select: { name: true } },
        _count: { select: { results: true } },
      },
    });

    return NextResponse.json({
      success: true,
      totalRuns: runs.length,
      runs: runs.map((r) => ({
        id: r.id,
        benchmarkName: r.benchmark.name,
        status: r.status,
        modelProvider: r.modelProvider,
        totalTests: r.totalTests,
        passedTests: r.passedTests,
        codePassRate: r.codePassRate,
        retrievalHitRate: r.retrievalHitRate,
        avgLatencyMs: r.avgLatencyMs,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: true,
      totalRuns: 0,
      runs: [],
      dbOffline: true,
      message: "PostgreSQL database offline; running in-memory mode.",
    });
  }
}
