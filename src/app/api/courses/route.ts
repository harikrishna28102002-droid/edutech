import { NextRequest, NextResponse } from "next/server";
import { getAllCourses, createCourse } from "@/lib/lms-service";
import { CourseLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/courses - List courses with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const level = searchParams.get("level") || undefined;
    const search = searchParams.get("q") || undefined;
    const instructorId = searchParams.get("instructorId") || undefined;

    const courses = await getAllCourses({
      category,
      level,
      search,
      instructorId,
    });

    return NextResponse.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
        details: error instanceof Error ? error.message : "Unknown error",
        courses: [],
      },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.title || !body.description || !body.categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, description, and categoryId are required.",
        },
        { status: 400 }
      );
    }

    const course = await createCourse({
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      level: (body.level as CourseLevel) || "BEGINNER",
      price: typeof body.price === "number" ? body.price : parseFloat(body.price || "0"),
      categoryId: body.categoryId,
      instructorId: body.instructorId || "usr_instructor_1",
      thumbnailUrl: body.thumbnailUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        course,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
