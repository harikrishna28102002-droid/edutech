import { NextResponse } from "next/server";
import { GITHUB_DISCUSSIONS_EVAL_SET } from "@/lib/eval-dataset";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbCases = await prisma.evalTestCase.findMany({
      orderBy: { createdAt: "asc" },
    });

    const cases = dbCases.length > 0 ? dbCases : GITHUB_DISCUSSIONS_EVAL_SET;

    // Categories aggregate
    const categoriesMap: Record<string, number> = {};
    for (const c of cases) {
      categoriesMap[c.category] = (categoriesMap[c.category] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      name: "FastAPI GitHub Discussions Benchmark (Top 10)",
      sourceRepo: "tiangolo/fastapi & fastapi/fastapi",
      totalCases: cases.length,
      categories: categoriesMap,
      testCases: cases,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: true,
      name: "FastAPI GitHub Discussions Benchmark (Top 10)",
      sourceRepo: "tiangolo/fastapi & fastapi/fastapi",
      totalCases: GITHUB_DISCUSSIONS_EVAL_SET.length,
      testCases: GITHUB_DISCUSSIONS_EVAL_SET,
    });
  }
}
