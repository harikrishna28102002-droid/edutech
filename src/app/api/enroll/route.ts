import { NextRequest, NextResponse } from "next/server";
import { enrollUserInCourse, getUserEnrollments } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// GET /api/enroll - Retrieve enrollments for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "usr_student_1";

    const enrollments = await getUserEnrollments(userId);

    return NextResponse.json({
      success: true,
      userId,
      count: enrollments.length,
      enrollments,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve enrollments",
        details: error instanceof Error ? error.message : "Unknown error",
        enrollments: [],
      },
      { status: 500 }
    );
  }
}

// POST /api/enroll - Enroll a user in a course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required to enroll" },
        { status: 400 }
      );
    }

    const userId = body.userId || "usr_student_1";
    const enrollment = await enrollUserInCourse(userId, body.courseId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully enrolled in course",
        enrollment,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to enroll in course",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
