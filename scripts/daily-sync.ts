import { runDailySync, getDailySyncStatus } from "../src/lib/daily-sync";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const reembed = !args.includes("--no-reembed");
  const jsonOutput = args.includes("--json");

  if (!jsonOutput) {
    console.log("==================================================================");
    console.log("⚡ EduTech Automated Daily Synchronization Pipeline");
    console.log("Source: tiangolo/fastapi (GitHub)");
    console.log(`Force: ${force} | Re-embedding: ${reembed}`);
    console.log("==================================================================\n");

    const initial = await getDailySyncStatus();
    console.log(`Current Status:   ${initial.status} (Freshness: ${initial.freshness})`);
    console.log(`Last Sync:        ${initial.hoursSinceLastSync}h ago (${initial.lastSyncAt})`);
    console.log(`Last Tracked SHA: ${initial.lastCommitSha}\n`);
    console.log("🚀 Executing sync and vector embedding generation...");
  }

  const result = await runDailySync({ force, reembed });

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  }

  console.log("------------------------------------------------------------------");
  console.log("🏆 Daily Sync Completed Successfully!");
  console.log(`Status:         ${result.status}`);
  console.log(`Commit SHA:     ${result.commitSha}`);
  console.log(`Duration:       ${result.durationMs}ms`);
  console.log(`Pages Total:    ${result.stats.total} (Added: ${result.stats.added}, Updated: ${result.stats.updated})`);
  console.log(`Chunks Indexed: ${result.stats.chunksEmbedded}`);
  console.log(`Message:        ${result.message}`);
  console.log("==================================================================");

  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error("❌ Daily sync execution failed:", err);
  process.exit(1);
});
