import { runEvaluationSuite } from "../src/lib/eval-runner";

async function main() {
  const args = process.argv.slice(2);
  let modelProvider: any = "local";
  let runSandboxTests = true;
  let categoryFilter: string | undefined;
  let threshold = 70;
  let jsonOutput = false;

  for (const arg of args) {
    if (arg.startsWith("--provider=")) {
      modelProvider = arg.split("=")[1];
    } else if (arg === "--no-sandbox") {
      runSandboxTests = false;
    } else if (arg.startsWith("--category=")) {
      categoryFilter = arg.split("=")[1];
    } else if (arg.startsWith("--threshold=")) {
      threshold = parseFloat(arg.split("=")[1]) || 70;
    } else if (arg === "--json") {
      jsonOutput = true;
    }
  }

  if (!jsonOutput) {
    console.log("==================================================================");
    console.log("📊 EduTech Automated Evaluation Benchmark Runner");
    console.log("Benchmark: FastAPI GitHub Discussions Evaluation Suite");
    console.log(`Provider:  ${modelProvider} | Sandbox: ${runSandboxTests} | Category: ${categoryFilter || "ALL"}`);
    console.log("==================================================================\n");
  }

  const summary = await runEvaluationSuite({
    modelProvider,
    runSandboxTests,
    categoryFilter,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.passRate >= threshold ? 0 : 1);
  }

  console.log("------------------------------------------------------------------");
  console.log("🏆 Benchmark Execution Scorecard:");
  console.log(`Run ID:              ${summary.runId}`);
  console.log(`Total Test Cases:    ${summary.totalTests}`);
  console.log(`Passed Cases:        ${summary.passedTests}/${summary.totalTests} (${summary.passRate}%)`);
  console.log(`Retrieval Hit Rate:  ${summary.retrievalHitRate}%`);
  console.log(`Sandbox Pass Rate:   ${summary.codePassRate}%`);
  console.log(`Latency (Avg/p50):   ${summary.avgLatencyMs}ms / ${summary.p50LatencyMs}ms`);
  console.log(`Latency (p90/p99):   ${summary.p90LatencyMs}ms / ${summary.p99LatencyMs}ms`);
  console.log(`Total Duration:      ${summary.durationMs}ms`);
  console.log("------------------------------------------------------------------\n");

  console.log("📂 Category Performance Breakdown:");
  summary.categoryBreakdown.forEach((cat) => {
    console.log(`  • ${cat.category.padEnd(16)}: ${cat.passed}/${cat.total} passed (${cat.passRate}%)`);
  });

  console.log("\n📋 Test Case Execution Details:");
  summary.results.forEach((r, idx) => {
    const hitSymbol = r.retrievalHit ? "✓" : "✗";
    const codeSymbol = r.codePassed ? "✓" : "✗";
    const status = r.score >= 60 ? "PASS" : "FAIL";
    console.log(
      `  [#${(idx + 1).toString().padStart(2, "0")}] [${status}] [Hit: ${hitSymbol} | Code: ${codeSymbol} | Score: ${r.score.toString().padStart(3, " ")}% | ${r.latencyMs}ms] ${r.question.slice(0, 50)}...`
    );
  });

  console.log("\n==================================================================");
  if (summary.passRate >= threshold) {
    console.log(`✅ EVALUATION SUITE PASSED (${summary.passRate}% >= threshold ${threshold}%)`);
    process.exit(0);
  } else {
    console.error(`❌ EVALUATION SUITE FAILED (${summary.passRate}% < threshold ${threshold}%)`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Fatal runner error:", err);
  process.exit(1);
});
