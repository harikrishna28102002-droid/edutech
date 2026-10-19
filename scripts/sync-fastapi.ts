import { syncFastApiDocs } from "../src/lib/fastapi-sync";

async function run() {
  console.log("=========================================");
  console.log("🔄 Starting FastAPI Documentation Ingestion");
  console.log("Source: https://github.com/tiangolo/fastapi");
  console.log("=========================================\n");

  const force = process.argv.includes("--force");
  const result = await syncFastApiDocs({ force });

  console.log("\n-----------------------------------------");
  console.log(`Status: ${result.status}`);
  console.log(`Message: ${result.message}`);
  console.log(`Commit SHA: ${result.commitSha}`);
  console.log(`Added: ${result.addedCount}`);
  console.log(`Updated: ${result.updatedCount}`);
  console.log(`Unchanged: ${result.unchangedCount}`);
  console.log(`Total Pages: ${result.totalCount}`);
  console.log(`Duration: ${result.durationMs}ms`);
  console.log("-----------------------------------------");

  if (!result.success) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("❌ Sync failed with unhandled exception:", err);
  process.exit(1);
});
