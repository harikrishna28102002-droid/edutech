import { NextRequest, NextResponse } from "next/server";
import { getDemoSession } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

// GET /api/auth/session - Retrieve active authentication session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role")?.toUpperCase();
    const role = (roleParam === "INSTRUCTOR" || roleParam === "ADMIN" || roleParam === "STUDENT")
      ? (roleParam as "STUDENT" | "INSTRUCTOR" | "ADMIN")
      : "STUDENT";

    const session = await getDemoSession(role);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resolve session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/auth/session - Authenticate or switch role session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const roleParam = (body.role || "STUDENT").toUpperCase();
    const role = (roleParam === "INSTRUCTOR" || roleParam === "ADMIN" || roleParam === "STUDENT")
      ? (roleParam as "STUDENT" | "INSTRUCTOR" | "ADMIN")
      : "STUDENT";

    const session = await getDemoSession(role);

    return NextResponse.json({
      success: true,
      message: `Authenticated as ${session.user.role}`,
      session,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to authenticate session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
