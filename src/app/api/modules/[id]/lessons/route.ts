import { NextRequest, NextResponse } from "next/server";
import { createLesson } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// POST /api/modules/[id]/lessons - Add a new lesson into a module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Lesson title is required" },
        { status: 400 }
      );
    }

    const lesson = await createLesson(id, {
      title: body.title,
      description: body.description,
      videoUrl: body.videoUrl,
      content: body.content || `# ${body.title}\n\nContent coming soon.`,
      durationMinutes: typeof body.durationMinutes === "number" ? body.durationMinutes : undefined,
      isFreePreview: Boolean(body.isFreePreview),
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: `Module '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lesson created successfully",
        lesson,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create lesson",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
