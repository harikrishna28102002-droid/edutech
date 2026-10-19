import { NextRequest, NextResponse } from "next/server";
import { executeCodeInSandbox } from "@/lib/sandbox";

export const dynamic = "force-dynamic";

// POST /api/sandbox/run: Execute code snippet in Docker sandbox
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = body.code;

    if (!code || typeof code !== "string" || code.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Field 'code' is required." },
        { status: 400 }
      );
    }

    const timeoutMs = typeof body.timeoutMs === "number" ? body.timeoutMs : 10000;
    const memoryLimit = body.memoryLimit || "512m";
    const networkAccess = body.networkAccess === true;

    const result = await executeCodeInSandbox({
      code,
      timeoutMs,
      memoryLimit,
      networkAccess,
    });

    return NextResponse.json({
      ...result,
    });
  } catch (error: unknown) {
    console.error("Sandbox API Execution Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute code in sandbox.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
