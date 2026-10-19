import { executeCodeInSandbox } from "../src/lib/sandbox";

async function run() {
  const code = `
from fastapi import FastAPI
from httpx import Client

app = FastAPI(title="CLI Sandbox Verification")

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id, "status": "verified", "powered_by": "Docker Sandbox"}

with Client(app=app, base_url="http://test") as client:
    res = client.get("/items/42")
    assert res.status_code == 200
    print("✓ Status: " + str(res.status_code))
    print("✓ Payload: " + str(res.json()))

print("\\n🎉 Docker Sandbox execution successfully verified!")
`;

  console.log("=========================================");
  console.log("🐳 Executing Code in Docker Sandbox");
  console.log("Limits: 512MB RAM | 1 CPU | No Network | Non-Root");
  console.log("=========================================\n");

  const result = await executeCodeInSandbox({
    code,
    timeoutMs: 10000,
    memoryLimit: "512m",
    networkAccess: false,
  });

  console.log(`⏱️ Duration:     ${result.durationMs}ms`);
  console.log(`🏷️ Sandbox Type: ${result.sandboxType}`);
  console.log(`🔒 Exit Code:    ${result.exitCode}\n`);

  if (result.stdout) {
    console.log("--- STDOUT ---");
    console.log(result.stdout);
  }

  if (result.stderr) {
    console.log("--- STDERR ---");
    console.log(result.stderr);
  }

  console.log("=========================================");
}

run().catch((err) => {
  console.error("❌ Sandbox run failed:", err);
  process.exit(1);
});
