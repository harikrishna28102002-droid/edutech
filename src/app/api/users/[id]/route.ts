import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// GET /api/users/[id] - Retrieve detailed user profile, courses, and enrollments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getUserProfile(id);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: `User '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
