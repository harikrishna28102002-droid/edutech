import { NextResponse } from "next/server";
import { ModelServer } from "@/lib/model-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const server = ModelServer.getInstance();
    const providers = await server.getAvailableProviders();

    return NextResponse.json({
      success: true,
      ...providers,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to inspect model providers.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
