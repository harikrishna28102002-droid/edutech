import { NextRequest, NextResponse } from "next/server";
import { recordLessonProgress, getUserProgress } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// GET /api/progress - Retrieve lesson progress records for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "usr_student_1";
    const courseId = searchParams.get("courseId") || undefined;

    const progressRecords = await getUserProgress(userId, courseId);

    return NextResponse.json({
      success: true,
      userId,
      count: progressRecords.length,
      progress: progressRecords,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve progress records",
        details: error instanceof Error ? error.message : "Unknown error",
        progress: [],
      },
      { status: 500 }
    );
  }
}

// POST /api/progress - Record lesson completion or video watch position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.lessonId) {
      return NextResponse.json(
        { success: false, error: "lessonId is required" },
        { status: 400 }
      );
    }

    const userId = body.userId || "usr_student_1";
    const isCompleted = body.isCompleted !== undefined ? Boolean(body.isCompleted) : true;
    const lastPositionSeconds = typeof body.lastPositionSeconds === "number" ? body.lastPositionSeconds : 0;

    const result = await recordLessonProgress({
      userId,
      lessonId: body.lessonId,
      isCompleted,
      lastPositionSeconds,
    });

    return NextResponse.json({
      success: true,
      message: "Progress recorded successfully",
      progress: result.progress,
      courseProgressPercent: result.courseProgressPercent,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to record progress",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
