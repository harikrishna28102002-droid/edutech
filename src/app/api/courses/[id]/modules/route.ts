import { NextRequest, NextResponse } from "next/server";
import { createModule } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// POST /api/courses/[id]/modules - Add a new curriculum module to a course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Module title is required" },
        { status: 400 }
      );
    }

    const newModule = await createModule(id, {
      title: body.title,
      orderIndex: typeof body.orderIndex === "number" ? body.orderIndex : undefined,
    });

    if (!newModule) {
      return NextResponse.json(
        { success: false, error: `Course '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Module created successfully",
        module: newModule,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create module",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
