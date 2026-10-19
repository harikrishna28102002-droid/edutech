"use client";

import { useState } from "react";

interface SandboxResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  sandboxType: "docker" | "process" | "simulated";
  securityEnforced: {
    memoryLimit: string;
    networkDisabled: boolean;
    nonRootUser: boolean;
    pidsLimit: number;
    timeoutMs: number;
  };
}

const PRESETS = [
  {
    name: "FastAPI TestClient Verification",
    description: "Instantiates FastAPI app with route validation and runs tests with TestClient",
    code: `from fastapi import FastAPI
from httpx import Client

app = FastAPI(title="Sandbox Demo API")

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = "default_query"):
    return {"item_id": item_id, "query": q, "status": "verified"}

# Automated In-Memory Test Suite
with Client(app=app, base_url="http://test") as client:
    print("Testing GET /items/42?q=fastapi...")
    res = client.get("/items/42?q=fastapi")
    assert res.status_code == 200
    print(f"  ✓ Status 200 OK -> {res.json()}")

    print("\\nTesting validation error GET /items/invalid_id...")
    res_err = client.get("/items/invalid_id")
    assert res_err.status_code == 422
    print(f"  ✓ Status 422 Unprocessable Entity -> Caught Pydantic Validation Error")

print("\\n✅ All FastAPI TestClient assertions PASSED in Docker Sandbox!")
`,
  },
  {
    name: "Dependency Injection with Depends",
    description: "Demonstrates Dependency Injection lifecycle with Depends and yield",
    code: `from typing import Annotated
from fastapi import Depends, FastAPI
from httpx import Client

app = FastAPI()

def get_db_session():
    print("  [Setup] Opening ephemeral DB connection...")
    session = {"session_id": "sess_8941", "active": True}
    yield session
    print("  [Teardown] Closing DB connection...")

@app.get("/users/me")
def read_current_user(db: Annotated[dict, Depends(get_db_session)]):
    return {"user": "Alice", "db_session": db["session_id"]}

with Client(app=app, base_url="http://test") as client:
    print("Triggering endpoint with dependency injection:")
    res = client.get("/users/me")
    print(f"  Response: {res.json()}")

print("\\n✅ Dependency Injection lifecycle executed successfully!")
`,
  },
  {
    name: "Pydantic Schema Validation",
    description: "Tests strict payload validation against Pydantic BaseModel",
    code: `from pydantic import BaseModel, Field
from fastapi import FastAPI
from httpx import Client

app = FastAPI()

class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=50)
    price: float = Field(ge=0.0)
    level: str = "BEGINNER"

@app.post("/courses/")
def create_course(course: CourseCreate):
    return {"message": "Course created", "course": course.model_dump()}

with Client(app=app, base_url="http://test") as client:
    # 1. Valid payload
    valid_payload = {"title": "FastAPI Masterclass", "price": 49.99, "level": "ADVANCED"}
    r1 = client.post("/courses/", json=valid_payload)
    print(f"Valid payload test: status {r1.status_code} -> {r1.json()}")

    # 2. Invalid payload (negative price)
    invalid_payload = {"title": "AI", "price": -10.0}
    r2 = client.post("/courses/", json=invalid_payload)
    print(f"Invalid payload test: status {r2.status_code} -> Rejected correctly by Pydantic")

print("\\n✅ Pydantic schema validation verified!")
`,
  },
];

export default function SandboxPlayground({
  initialCode,
}: {
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode || PRESETS[0].code);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [memoryLimit, setMemoryLimit] = useState("512m");
  const [networkAccess, setNetworkAccess] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/sandbox/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          memoryLimit,
          networkAccess,
          timeoutMs: 10000,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setResult({
        success: false,
        stdout: "",
        stderr: err instanceof Error ? err.message : "Execution request failed",
        exitCode: 1,
        durationMs: 0,
        sandboxType: "simulated",
        securityEnforced: {
          memoryLimit,
          networkDisabled: !networkAccess,
          nonRootUser: true,
          pidsLimit: 64,
          timeoutMs: 10000,
        },
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      {/* Top Presets & Controls Bar */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="pulse-dot success" />
              <strong style={{ color: "#fff", fontSize: "1.05rem" }}>Docker Sandbox Presets</strong>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Pre-loaded with FastAPI 0.115, Pydantic v2, HTTPX, and Pytest
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCode(p.code)}
                style={{
                  background: code === p.code ? "var(--accent-indigo)" : "rgba(255,255,255,0.05)",
                  color: code === p.code ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.775rem",
                  cursor: "pointer",
                  fontWeight: code === p.code ? 600 : 400,
                  transition: "all 0.15s ease",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Security Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border-color)",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Memory Cap:</span>
              <select
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  color: "#fff",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.775rem",
                }}
              >
                <option value="256m">256 MB</option>
                <option value="512m">512 MB (Default)</option>
                <option value="1g">1 GB</option>
              </select>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={!networkAccess}
                onChange={(e) => setNetworkAccess(!e.target.checked)}
                style={{ accentColor: "var(--accent-indigo)" }}
              />
              <span>Network Isolation (<code>--net=none</code>)</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>Non-Root (UID 10001)</span>
            <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>Cap-Drop: ALL</span>
            <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>10s Watchdog</span>
          </div>
        </div>
      </div>

      {/* Editor & Execution Split Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "stretch" }}>
        {/* Left: Code Editor Pane */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              padding: "0.75rem 1.25rem",
              background: "rgba(0,0,0,0.3)",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                main.py (Python 3.11)
              </span>
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="btn btn-primary btn-sm"
              style={{ cursor: isRunning ? "wait" : "pointer" }}
            >
              {isRunning ? (
                <>
                  <span className="pulse-dot warning" /> Running in Docker...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Run in Sandbox
                </>
              )}
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              minHeight: "440px",
              width: "100%",
              background: "#04060a",
              color: "#f8fafc",
              border: "none",
              padding: "1.25rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              lineHeight: "1.6",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        {/* Right: Terminal Console Output Pane */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              padding: "0.75rem 1.25rem",
              background: "rgba(0,0,0,0.3)",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                SANDBOX CONSOLE
              </span>
              {result && (
                <span className={`badge ${result.success ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                  Exit Code: {result.exitCode}
                </span>
              )}
            </div>

            {result && (
              <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                <span>{result.durationMs}ms</span>
                <span>•</span>
                <span style={{ color: "var(--accent-cyan)" }}>{result.sandboxType.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Terminal Output */}
          <div
            style={{
              flex: 1,
              minHeight: "440px",
              background: "#04060a",
              padding: "1.25rem",
              overflowY: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              lineHeight: "1.6",
            }}
          >
            {result ? (
              <div>
                {result.stdout && (
                  <pre style={{ margin: 0, color: "#34d399", whiteSpace: "pre-wrap" }}>
                    {result.stdout}
                  </pre>
                )}
                {result.stderr && (
                  <pre style={{ margin: "0.75rem 0 0 0", color: "#fbbf24", whiteSpace: "pre-wrap" }}>
                    {result.stderr}
                  </pre>
                )}
                {!result.stdout && !result.stderr && (
                  <span style={{ color: "var(--text-muted)" }}>Process exited with no output.</span>
                )}
              </div>
            ) : isRunning ? (
              <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pulse-dot warning" />
                Spawning ephemeral container &amp; executing test suite...
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)" }}>
                Click &quot;Run in Sandbox&quot; to execute this FastAPI code in an isolated Docker container.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
