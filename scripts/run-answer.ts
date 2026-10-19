import { AnswerPipeline } from "../src/lib/answer-pipeline";

async function run() {
  const args = process.argv.slice(2);
  const question = args.join(" ").trim() || "How do I implement Dependency Injection in FastAPI using Depends?";

  console.log("=================================================");
  console.log("🤖 Running EduTech RAG Answer Pipeline");
  console.log(`Question: "${question}"`);
  console.log("=================================================\n");

  const pipeline = AnswerPipeline.getInstance();
  const startTime = Date.now();

  console.log("🔍 Step 1: Executing Hybrid Search & Contextual Reranking...");
  const result = await pipeline.runPipeline(question);

  console.log(`⏱️ Retrieval Time:  ${result.timings.retrievalMs}ms`);
  console.log(`⏱️ Generation Time: ${result.timings.generationMs}ms`);
  console.log(`⏱️ Total Latency:   ${result.timings.totalMs}ms`);
  console.log(`🏷️ Model Provider:  ${result.modelProvider}\n`);

  console.log("-------------------------------------------------");
  console.log("📚 Grounded Citation Sources:");
  result.sources.forEach((s) => {
    console.log(`  [${s.index}] ${s.title} (${s.path}) — Score: ${Math.round(s.score * 100)}%`);
  });
  console.log("-------------------------------------------------\n");

  console.log("💡 Synthesized Answer:\n");
  console.log(result.answer);
  console.log("\n=================================================");
}

run().catch((err) => {
  console.error("❌ Answer pipeline failed:", err);
  process.exit(1);
});
