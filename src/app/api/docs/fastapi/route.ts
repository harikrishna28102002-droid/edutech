import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("q");

    const source = await prisma.docSource.findUnique({
      where: { name: "FastAPI Official Documentation" },
    });

    if (!source) {
      return NextResponse.json({
        success: true,
        count: 0,
        source: null,
        docs: [],
        categories: [],
      });
    }

    const whereClause: Record<string, unknown> = {
      sourceId: source.id,
    };

    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { path: { contains: search, mode: "insensitive" } },
      ];
    }

    const docs = await prisma.docPage.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        path: true,
        githubUrl: true,
        excerpt: true,
        orderIndex: true,
        updatedAt: true,
      },
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }],
    });

    // Group categories
    const categories = Array.from(new Set(docs.map((d) => d.category)));

    return NextResponse.json({
      success: true,
      count: docs.length,
      source: {
        id: source.id,
        name: source.name,
        repo: source.repo,
        lastCommitSha: source.lastCommitSha,
        lastSyncAt: source.lastSyncAt,
      },
      categories,
      docs,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch FastAPI documents.",
        details: error instanceof Error ? error.message : "Unknown error",
        docs: [],
      },
      { status: 500 }
    );
  }
}
