import fs from "fs";
import path from "path";
import {
  generateTrainingDataset,
  serializeDataset,
  DatasetFormat,
} from "../src/lib/training-generator";

async function run() {
  console.log("=================================================");
  console.log("🧠 Synthesizing Training Data from Real Doc Chunks");
  console.log("Repository: tiangolo/fastapi & fastapi/fastapi");
  console.log("=================================================\n");

  const startTime = Date.now();

  // 1. Generate Alpaca Dataset
  console.log("⏳ 1/4: Generating Alpaca Instruction Tuning Dataset...");
  const alpacaDataset = await generateTrainingDataset({
    name: "FastAPI Official Doc Chunks (Alpaca Instruction-Tuning)",
    format: "ALPACA",
    trainRatio: 0.8,
    valRatio: 0.1,
    testRatio: 0.1,
    maxSamples: 60,
  });

  // 2. Generate ChatML Dataset
  console.log("⏳ 2/4: Generating ChatML Conversational Dataset...");
  const chatmlDataset = await generateTrainingDataset({
    name: "FastAPI Official Doc Chunks (ChatML Multi-turn)",
    format: "CHATML",
    trainRatio: 0.8,
    valRatio: 0.1,
    testRatio: 0.1,
    maxSamples: 60,
  });

  // 3. Generate DPO Preference Dataset
  console.log("⏳ 3/4: Generating DPO Direct Preference Dataset...");
  const dpoDataset = await generateTrainingDataset({
    name: "FastAPI Official Doc Chunks (DPO Chosen vs Rejected)",
    format: "DPO",
    trainRatio: 0.8,
    valRatio: 0.1,
    testRatio: 0.1,
    maxSamples: 60,
  });

  // 4. Generate Retrieval Triplet Dataset
  console.log("⏳ 4/4: Generating Bi-Encoder Retrieval Triplet Dataset...");
  const tripletDataset = await generateTrainingDataset({
    name: "FastAPI Official Doc Chunks (Dense Retrieval Triplets)",
    format: "RETRIEVAL_TRIPLET",
    trainRatio: 0.8,
    valRatio: 0.1,
    testRatio: 0.1,
    maxSamples: 60,
  });

  // Ensure export output directory exists
  const exportDir = path.resolve(process.cwd(), "data", "training");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Write files
  const trainAlpaca = alpacaDataset.samples.filter((s) => s.split === "TRAIN");
  const valAlpaca = alpacaDataset.samples.filter((s) => s.split === "VALIDATION");
  const testAlpaca = alpacaDataset.samples.filter((s) => s.split === "TEST");

  const alpacaTrainPath = path.join(exportDir, "fastapi_alpaca_train.jsonl");
  const alpacaValPath = path.join(exportDir, "fastapi_alpaca_val.jsonl");
  const alpacaTestPath = path.join(exportDir, "fastapi_alpaca_test.jsonl");
  const chatmlPath = path.join(exportDir, "fastapi_chatml.jsonl");
  const dpoPath = path.join(exportDir, "fastapi_dpo.jsonl");
  const tripletPath = path.join(exportDir, "fastapi_triplets.jsonl");

  fs.writeFileSync(alpacaTrainPath, serializeDataset(trainAlpaca, "ALPACA", "jsonl"), "utf-8");
  fs.writeFileSync(alpacaValPath, serializeDataset(valAlpaca, "ALPACA", "jsonl"), "utf-8");
  fs.writeFileSync(alpacaTestPath, serializeDataset(testAlpaca, "ALPACA", "jsonl"), "utf-8");
  fs.writeFileSync(chatmlPath, serializeDataset(chatmlDataset.samples, "CHATML", "jsonl"), "utf-8");
  fs.writeFileSync(dpoPath, serializeDataset(dpoDataset.samples, "DPO", "jsonl"), "utf-8");
  fs.writeFileSync(tripletPath, serializeDataset(tripletDataset.samples, "RETRIEVAL_TRIPLET", "jsonl"), "utf-8");

  const durationMs = Date.now() - startTime;

  console.log("\n-------------------------------------------------");
  console.log("🏆 Training Dataset Generation Complete!");
  console.log(`Duration:               ${durationMs}ms`);
  console.log(`Total Samples / Set:    ${alpacaDataset.totalSamples}`);
  console.log(`Train Split:            ${trainAlpaca.length} samples (80%)`);
  console.log(`Validation Split:       ${valAlpaca.length} samples (10%)`);
  console.log(`Test Split:             ${testAlpaca.length} samples (10%)`);
  console.log("-------------------------------------------------");
  console.log("📦 Exported JSONL Files:");
  console.log(`  - Alpaca Train:       ${alpacaTrainPath} (${fs.statSync(alpacaTrainPath).size} bytes)`);
  console.log(`  - Alpaca Val:         ${alpacaValPath} (${fs.statSync(alpacaValPath).size} bytes)`);
  console.log(`  - Alpaca Test:        ${alpacaTestPath} (${fs.statSync(alpacaTestPath).size} bytes)`);
  console.log(`  - ChatML Full:        ${chatmlPath} (${fs.statSync(chatmlPath).size} bytes)`);
  console.log(`  - DPO Preferences:    ${dpoPath} (${fs.statSync(dpoPath).size} bytes)`);
  console.log(`  - Retrieval Triplets: ${tripletPath} (${fs.statSync(tripletPath).size} bytes)`);
  console.log("=================================================\n");
}

run().catch((err) => {
  console.error("❌ Training data generation failed:", err);
  process.exit(1);
});
