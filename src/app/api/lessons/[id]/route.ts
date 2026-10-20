import { NextRequest, NextResponse } from "next/server";
import { getLessonById, updateLesson, deleteLesson } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// GET /api/lessons/[id] - Retrieve single lesson details with module context and navigation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await getLessonById(id);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: `Lesson '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve lesson",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/[id] - Update lesson content or properties
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const updated = await updateLesson(id, {
      title: body.title,
      description: body.description,
      content: body.content,
      videoUrl: body.videoUrl,
      durationMinutes: typeof body.durationMinutes === "number" ? body.durationMinutes : undefined,
      isFreePreview: typeof body.isFreePreview === "boolean" ? body.isFreePreview : undefined,
      orderIndex: typeof body.orderIndex === "number" ? body.orderIndex : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Lesson '${id}' not found for update` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update lesson",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id] - Remove a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteLesson(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Lesson '${id}' not found or could not be deleted` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Lesson '${id}' deleted successfully`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete lesson",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
