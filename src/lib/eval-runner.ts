import prisma from "./prisma";
import { GITHUB_DISCUSSIONS_EVAL_SET, CuratedEvalCase } from "./eval-dataset";
import { AnswerPipeline } from "./answer-pipeline";
import { executeCodeInSandbox } from "./sandbox";

export interface EvalRunSummary {
  runId: string;
  benchmarkName: string;
  totalTests: number;
  passedTests: number;
  codePassRate: number;
  retrievalHitRate: number;
  avgLatencyMs: number;
  modelProvider: string;
  durationMs: number;
  results: {
    testCaseId: string;
    question: string;
    category: string;
    retrievalHit: boolean;
    codePassed: boolean;
    latencyMs: number;
    score: number;
    generatedAnswer: string;
    targetDocPath: string | null;
    sandboxStdout: string | null;
    sandboxStderr: string | null;
  }[];
}

// Seed or update the evaluation dataset in PostgreSQL
export async function seedEvaluationBenchmark(): Promise<string | null> {
  try {
    const benchmark = await prisma.evalBenchmark.upsert({
      where: { name: "FastAPI GitHub Discussions Benchmark (Top 10)" },
      create: {
        name: "FastAPI GitHub Discussions Benchmark (Top 10)",
        description:
          "Standard evaluation benchmark derived from real answered developer questions on github.com/fastapi/fastapi covering dependencies, routing, validation, Docker, testing, and async.",
        sourceRepo: "fastapi/fastapi",
        totalCases: GITHUB_DISCUSSIONS_EVAL_SET.length,
      },
      update: {
        totalCases: GITHUB_DISCUSSIONS_EVAL_SET.length,
      },
    });

    for (const item of GITHUB_DISCUSSIONS_EVAL_SET) {
      const existing = await prisma.evalTestCase.findFirst({
        where: {
          benchmarkId: benchmark.id,
          discussionNumber: item.discussionNumber,
        },
      });

      if (!existing) {
        await prisma.evalTestCase.create({
          data: {
            benchmarkId: benchmark.id,
            discussionNumber: item.discussionNumber,
            discussionUrl: item.discussionUrl,
            category: item.category,
            question: item.question,
            referenceAnswer: item.referenceAnswer,
            targetDocPath: item.targetDocPath,
            verificationCode: item.verificationCode,
            tags: item.tags,
          },
        });
      } else {
        await prisma.evalTestCase.update({
          where: { id: existing.id },
          data: {
            question: item.question,
            referenceAnswer: item.referenceAnswer,
            targetDocPath: item.targetDocPath,
            verificationCode: item.verificationCode,
            tags: item.tags,
          },
        });
      }
    }

    return benchmark.id;
  } catch (err: unknown) {
    console.warn("Notice: PostgreSQL is offline. Benchmark running in memory fallback mode.");
    return null;
  }
}

// Run the full evaluation suite
export async function runEvaluationSuite(options: {
  modelProvider?: "auto" | "local" | "ollama" | "openai" | "gemini";
  runSandboxTests?: boolean;
} = {}): Promise<EvalRunSummary> {
  const { modelProvider = "local", runSandboxTests = true } = options;
  const startTime = Date.now();

  let benchmarkId: string | null = null;
  let isDbAvailable = false;
  let testCases: Array<{
    id: string;
    discussionNumber: number | null;
    discussionUrl: string | null;
    category: string;
    question: string;
    referenceAnswer: string;
    targetDocPath: string | null;
    verificationCode: string | null;
    tags: string[];
  }> = [];

  // 1. Try to load or seed benchmark from PostgreSQL
  try {
    let benchmark = await prisma.evalBenchmark.findUnique({
      where: { name: "FastAPI GitHub Discussions Benchmark (Top 10)" },
      include: { testCases: true },
    });

    if (!benchmark || benchmark.testCases.length === 0) {
      await seedEvaluationBenchmark();
      benchmark = await prisma.evalBenchmark.findUnique({
        where: { name: "FastAPI GitHub Discussions Benchmark (Top 10)" },
        include: { testCases: true },
      });
    }

    if (benchmark && benchmark.testCases.length > 0) {
      benchmarkId = benchmark.id;
      isDbAvailable = true;
      testCases = benchmark.testCases;
    }
  } catch (err) {
    isDbAvailable = false;
  }

  // Fallback to static in-memory evaluation set if DB is offline
  if (testCases.length === 0) {
    testCases = GITHUB_DISCUSSIONS_EVAL_SET.map((c) => ({
      id: `gh-disc-${c.discussionNumber}`,
      discussionNumber: c.discussionNumber,
      discussionUrl: c.discussionUrl,
      category: c.category,
      question: c.question,
      referenceAnswer: c.referenceAnswer,
      targetDocPath: c.targetDocPath,
      verificationCode: c.verificationCode,
      tags: c.tags,
    }));
  }

  const pipeline = AnswerPipeline.getInstance();

  // 2. Create EvalRun record in database if DB available
  let runId = `run_${Date.now()}`;
  if (isDbAvailable && benchmarkId) {
    try {
      const run = await prisma.evalRun.create({
        data: {
          benchmarkId,
          modelProvider,
          totalTests: testCases.length,
          status: "RUNNING",
        },
      });
      runId = run.id;
    } catch (err) {
      isDbAvailable = false;
    }
  }

  let passedTests = 0;
  let codePassedCount = 0;
  let retrievalHitCount = 0;
  let totalLatency = 0;
  const detailedResults = [];

  // 3. Execute evaluation for each test case
  for (const tc of testCases) {
    const tCaseStart = Date.now();

    // A. Run RAG Answer Pipeline
    const answerResult = await pipeline.runPipeline(tc.question, modelProvider);
    const caseLatency = Date.now() - tCaseStart;
    totalLatency += caseLatency;

    // B. Check Retrieval Accuracy (Hit Rate)
    const retrievedPaths = answerResult.sources.map((s) => s.path);
    const retrievalHit = tc.targetDocPath
      ? retrievedPaths.some((p) => p.includes(tc.targetDocPath!) || tc.targetDocPath!.includes(p))
      : true;

    if (retrievalHit) retrievalHitCount++;

    // C. Execute Code Verification in Docker Sandbox
    let codeExecuted = false;
    let codePassed = false;
    let sandboxStdout: string | null = null;
    let sandboxStderr: string | null = null;

    if (runSandboxTests && tc.verificationCode) {
      codeExecuted = true;
      try {
        const sandboxRes = await executeCodeInSandbox({
          code: tc.verificationCode,
          timeoutMs: 8000,
          networkAccess: false,
        });

        codePassed = sandboxRes.exitCode === 0;
        sandboxStdout = sandboxRes.stdout;
        sandboxStderr = sandboxRes.stderr;

        if (codePassed) codePassedCount++;
      } catch (err: unknown) {
        codePassed = false;
        sandboxStderr = err instanceof Error ? err.message : "Sandbox execution error";
      }
    }

    // D. Compute composite test score (0 - 100)
    let score = 0;
    if (retrievalHit) score += 40;
    if (codePassed) score += 40;
    if (answerResult.answer && answerResult.answer.length > 50) score += 20;

    const testPassed = score >= 60;
    if (testPassed) passedTests++;

    // E. Record individual result in database if available
    if (isDbAvailable) {
      try {
        await prisma.evalResult.create({
          data: {
            runId,
            testCaseId: tc.id,
            generatedAnswer: answerResult.answer,
            retrievedSources: answerResult.sources,
            retrievalHit,
            codeExecuted,
            codePassed,
            sandboxStdout,
            sandboxStderr,
            latencyMs: caseLatency,
            score,
          },
        });
      } catch (err) {
        // Continue evaluation without failing
      }
    }

    detailedResults.push({
      testCaseId: tc.id,
      question: tc.question,
      category: tc.category,
      retrievalHit,
      codePassed,
      latencyMs: caseLatency,
      score,
      generatedAnswer: answerResult.answer,
      targetDocPath: tc.targetDocPath,
      sandboxStdout,
      sandboxStderr,
    });
  }

  // 4. Calculate final metrics
  const totalTests = testCases.length;
  const codePassRate = totalTests > 0 ? (codePassedCount / totalTests) * 100 : 0;
  const retrievalHitRate = totalTests > 0 ? (retrievalHitCount / totalTests) * 100 : 0;
  const avgLatencyMs = totalTests > 0 ? Math.round(totalLatency / totalTests) : 0;
  const durationMs = Date.now() - startTime;

  // 5. Update EvalRun record in DB if available
  if (isDbAvailable) {
    try {
      await prisma.evalRun.update({
        where: { id: runId },
        data: {
          status: "COMPLETED",
          passedTests,
          codePassRate: Number(codePassRate.toFixed(1)),
          retrievalHitRate: Number(retrievalHitRate.toFixed(1)),
          avgLatencyMs,
        },
      });
    } catch (err) {
      // Ignore
    }
  }

  return {
    runId,
    benchmarkName: "FastAPI GitHub Discussions Benchmark (Top 10)",
    totalTests,
    passedTests,
    codePassRate: Number(codePassRate.toFixed(1)),
    retrievalHitRate: Number(retrievalHitRate.toFixed(1)),
    avgLatencyMs,
    modelProvider,
    durationMs,
    results: detailedResults,
  };
}
