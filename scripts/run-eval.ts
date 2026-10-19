import { runEvaluationSuite } from "../src/lib/eval-runner";

async function run() {
  console.log("=================================================");
  console.log("📊 Running Evaluation Benchmark Suite");
  console.log("Source: Real GitHub Discussions (fastapi/fastapi)");
  console.log("=================================================\n");

  const summary = await runEvaluationSuite({
    modelProvider: "local",
    runSandboxTests: true,
  });

  console.log("-------------------------------------------------");
  console.log("🏆 Benchmark Execution Summary:");
  console.log(`Benchmark Name:     ${summary.benchmarkName}`);
  console.log(`Total Cases:        ${summary.totalTests}`);
  console.log(`Passed Cases:       ${summary.passedTests}/${summary.totalTests}`);
  console.log(`Retrieval Hit Rate: ${summary.retrievalHitRate}%`);
  console.log(`Sandbox Pass Rate:  ${summary.codePassRate}%`);
  console.log(`Average Latency:    ${summary.avgLatencyMs}ms`);
  console.log(`Duration:           ${summary.durationMs}ms`);
  console.log("-------------------------------------------------\n");

  console.log("📋 Individual Discussion Results:");
  summary.results.forEach((r, idx) => {
    const hitSymbol = r.retrievalHit ? "✓" : "✗";
    const codeSymbol = r.codePassed ? "✓" : "✗";
    console.log(
      `  [#${idx + 1}] [Hit: ${hitSymbol} | Code: ${codeSymbol} | Score: ${r.score}%] ${r.question.slice(0, 65)}...`
    );
  });

  console.log("\n=================================================");
}

run().catch((err) => {
  console.error("❌ Evaluation run failed:", err);
  process.exit(1);
});
