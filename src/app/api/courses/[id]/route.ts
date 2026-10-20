import { NextRequest, NextResponse } from "next/server";
import { getCourseByIdOrSlug, updateCourse, deleteCourse } from "@/lib/lms-service";
import { CourseLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/courses/[id] - Retrieve single course by ID or slug with full curriculum & reviews
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await getCourseByIdOrSlug(id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: `Course '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve course",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const updated = await updateCourse(id, {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      level: body.level as CourseLevel,
      price: typeof body.price === "number" ? body.price : body.price ? parseFloat(body.price) : undefined,
      isPublished: body.isPublished,
      thumbnailUrl: body.thumbnailUrl,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Course '${id}' not found for update` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      course: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Remove a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteCourse(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: `Course '${id}' not found or could not be deleted` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Course '${id}' deleted successfully`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
