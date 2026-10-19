import { hybridSearch, SearchResultChunk } from "./hybrid-search";
import { ModelServer, StreamEvent } from "./model-server";

export interface AnswerPipelineResult {
  question: string;
  answer: string;
  sources: {
    index: number;
    title: string;
    path: string;
    url: string;
    snippet: string;
    score: number;
  }[];
  timings: {
    retrievalMs: number;
    generationMs: number;
    totalMs: number;
  };
  modelProvider: string;
}

export class AnswerPipeline {
  private static instance: AnswerPipeline;

  public static getInstance(): AnswerPipeline {
    if (!AnswerPipeline.instance) {
      AnswerPipeline.instance = new AnswerPipeline();
    }
    return AnswerPipeline.instance;
  }

  // Execute full streaming RAG pipeline
  public async *streamPipeline(
    question: string,
    modelProvider: "auto" | "local" | "ollama" | "openai" | "gemini" = "auto"
  ): AsyncGenerator<StreamEvent> {
    const tStart = Date.now();

    // 1. Hybrid Search Retrieval & Contextual Reranking
    const searchRes = await hybridSearch({
      query: question,
      mode: "hybrid",
      rerank: true,
      limit: 4,
    });

    const retrievalMs = searchRes.timings.totalMs;

    // Emit retrieval metadata event
    yield {
      type: "citation",
      metadata: {
        retrievalMs,
        totalCandidates: searchRes.totalCandidates,
        sources: searchRes.results.map((r, idx) => ({
          index: idx + 1,
          title: r.heading || r.docTitle,
          path: r.docPath,
          url: r.githubUrl,
          snippet: r.snippet,
          score: r.finalScore,
        })),
      },
    };

    // 2. Format context chunks
    const contextChunks = searchRes.results.map((r) => ({
      heading: r.heading,
      headingPath: r.headingPath,
      docTitle: r.docTitle,
      docPath: r.docPath,
      content: r.content,
      githubUrl: r.githubUrl,
    }));

    // 3. Stream generation from ModelServer
    const modelServer = ModelServer.getInstance();
    const stream = modelServer.streamAnswer(question, contextChunks, {
      provider: modelProvider,
    });

    for await (const event of stream) {
      if (event.type === "done") {
        yield {
          type: "done",
          metadata: {
            ...event.metadata,
            retrievalMs,
            totalMs: Date.now() - tStart,
          },
        };
      } else {
        yield event;
      }
    }
  }

  // Execute synchronous non-streaming RAG pipeline
  public async runPipeline(
    question: string,
    modelProvider: "auto" | "local" | "ollama" | "openai" | "gemini" = "auto"
  ): Promise<AnswerPipelineResult> {
    const tStart = Date.now();

    // 1. Hybrid Search Retrieval & Contextual Reranking
    const searchRes = await hybridSearch({
      query: question,
      mode: "hybrid",
      rerank: true,
      limit: 4,
    });

    const retrievalMs = searchRes.timings.totalMs;

    const contextChunks = searchRes.results.map((r) => ({
      heading: r.heading,
      headingPath: r.headingPath,
      docTitle: r.docTitle,
      docPath: r.docPath,
      content: r.content,
      githubUrl: r.githubUrl,
    }));

    // 2. Synthesize answer
    const modelServer = ModelServer.getInstance();
    let answerText = "";

    const stream = modelServer.streamAnswer(question, contextChunks, {
      provider: modelProvider,
    });

    for await (const event of stream) {
      if (event.type === "token" && event.content) {
        answerText += event.content;
      }
    }

    const totalMs = Date.now() - tStart;
    const generationMs = totalMs - retrievalMs;

    return {
      question,
      answer: answerText,
      sources: searchRes.results.map((r, idx) => ({
        index: idx + 1,
        title: r.heading || r.docTitle,
        path: r.docPath,
        url: r.githubUrl,
        snippet: r.snippet,
        score: r.finalScore,
      })),
      timings: {
        retrievalMs,
        generationMs,
        totalMs,
      },
      modelProvider: modelProvider === "auto" ? "local" : modelProvider,
    };
  }
}
