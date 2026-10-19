import { NextRequest, NextResponse } from "next/server";
import { AnswerPipeline } from "@/lib/answer-pipeline";

export const dynamic = "force-dynamic";

// POST /api/answer: Run the RAG answer pipeline with streaming SSE support
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = body.question || body.q;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Field 'question' is required." },
        { status: 400 }
      );
    }

    const modelProvider = body.modelProvider || "auto";
    const wantStream = body.stream !== false;
    const pipeline = AnswerPipeline.getInstance();

    if (!wantStream) {
      // Synchronous JSON response
      const result = await pipeline.runPipeline(question, modelProvider);
      return NextResponse.json({ success: true, ...result });
    }

    // Stream SSE Response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = pipeline.streamPipeline(question, modelProvider);
          for await (const event of generator) {
            const dataStr = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(dataStr));
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : "Error during generation stream";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", content: errMsg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Answer Pipeline API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run answer pipeline.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
