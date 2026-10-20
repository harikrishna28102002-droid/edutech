import { NextRequest, NextResponse } from "next/server";
import { getCourseReviews, addCourseReview } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// GET /api/courses/[id]/reviews - Get all reviews for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await getCourseReviews(id);

    return NextResponse.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
        details: error instanceof Error ? error.message : "Unknown error",
        reviews: [],
      },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/reviews - Add a review/rating for a course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    if (body.rating === undefined || body.rating === null) {
      return NextResponse.json(
        { success: false, error: "Rating (1-5) is required" },
        { status: 400 }
      );
    }

    const rating = Math.max(1, Math.min(5, Number(body.rating)));
    const userId = body.userId || "usr_student_1";

    const review = await addCourseReview({
      userId,
      courseId: id,
      rating,
      comment: body.comment,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        review,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
