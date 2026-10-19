import { embedAllDocPages } from "../src/lib/embed-service";

async function run() {
  console.log("=========================================");
  console.log("🧠 Starting Document Chunking & Embedding");
  console.log("Vector Dimension: 384 | Target: PostgreSQL DocChunk");
  console.log("=========================================\n");

  const stats = await embedAllDocPages();

  console.log("-----------------------------------------");
  console.log("✅ Chunking and Vector Embedding Complete!");
  console.log(`Pages Processed: ${stats.pagesProcessed}`);
  console.log(`Chunks Created:  ${stats.chunksCreated}`);
  console.log(`Total Tokens:    ${stats.totalTokens}`);
  console.log(`Elapsed Time:    ${stats.durationMs}ms`);
  console.log("-----------------------------------------");
}

run().catch((err) => {
  console.error("❌ Embedding job failed:", err);
  process.exit(1);
});
