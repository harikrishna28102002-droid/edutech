import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/lib/lms-service";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/users - List users with optional role filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role")?.toUpperCase();
    const role = (roleParam === "STUDENT" || roleParam === "INSTRUCTOR" || roleParam === "ADMIN")
      ? (roleParam as Role)
      : undefined;

    const users = await getAllUsers(role);

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
        users: [],
      },
      { status: 500 }
    );
  }
}
