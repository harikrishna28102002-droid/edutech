import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const doc = await prisma.docPage.findFirst({
      where: { slug },
      include: {
        source: {
          select: {
            name: true,
            repo: true,
            branch: true,
            lastCommitSha: true,
            lastSyncAt: true,
          },
        },
      },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Documentation page not found" },
        { status: 404 }
      );
    }

    // Get previous and next documents in same category for navigation
    const [prevDoc, nextDoc] = await Promise.all([
      prisma.docPage.findFirst({
        where: {
          sourceId: doc.sourceId,
          category: doc.category,
          orderIndex: { lt: doc.orderIndex },
        },
        orderBy: { orderIndex: "desc" },
        select: { title: true, slug: true },
      }),
      prisma.docPage.findFirst({
        where: {
          sourceId: doc.sourceId,
          category: doc.category,
          orderIndex: { gt: doc.orderIndex },
        },
        orderBy: { orderIndex: "asc" },
        select: { title: true, slug: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      doc,
      navigation: {
        prev: prevDoc,
        next: nextDoc,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve doc page.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
