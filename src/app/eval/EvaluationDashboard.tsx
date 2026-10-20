"use client";

import { useState } from "react";
import Link from "next/link";
import { GITHUB_DISCUSSIONS_EVAL_SET, CuratedEvalCase } from "@/lib/eval-dataset";

interface EvalResultItem {
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
}

interface EvalRunData {
  runId: string;
  benchmarkName: string;
  totalTests: number;
  passedTests: number;
  codePassRate: number;
  retrievalHitRate: number;
  avgLatencyMs: number;
  modelProvider: string;
  durationMs: number;
  results: EvalResultItem[];
}

export default function EvaluationDashboard({
  initialCases,
}: {
  initialCases: CuratedEvalCase[];
}) {
  const [testCases] = useState<CuratedEvalCase[]>(initialCases);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runData, setRunData] = useState<EvalRunData | null>(null);
  const [selectedResultIdx, setSelectedResultIdx] = useState<number | null>(null);
  const [runSandbox, setRunSandbox] = useState<boolean>(true);
  const [modelProvider, setModelProvider] = useState<"local" | "ollama" | "openai">("local");

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setRunData(null);
    setSelectedResultIdx(null);

    try {
      const res = await fetch("/api/eval/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelProvider,
          runSandboxTests: runSandbox,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRunData(data);
        if (data.results && data.results.length > 0) {
          setSelectedResultIdx(0);
        }
      }
    } catch (err: unknown) {
      console.error("Evaluation run failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const activeCase = testCases[selectedCaseIdx] || testCases[0];
  const activeResult = runData && selectedResultIdx !== null ? runData.results[selectedResultIdx] : null;

  return (
    <div>
      {/* Top Benchmark Overview & Controls */}
      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1.75rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <span className="pulse-dot success" />
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>
                FastAPI GitHub Discussions Benchmark Suite
              </h2>
              <span className="badge badge-purple">10 Real Q&amp;A Scenarios</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: "680px" }}>
              Sourced from official maintainer-answered discussions on{" "}
              <a
                href="https://github.com/fastapi/fastapi/discussions"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
              >
                github.com/fastapi/fastapi
              </a>
              . Evaluates retrieval accuracy, ground-truth alignment, and executes generated Python code inside the Docker Sandbox.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/eval/compare" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              🏆 Compare Base Models
            </Link>
            <button
              onClick={handleRunEvaluation}
              disabled={isRunning}
              className="btn btn-primary"
              style={{ cursor: isRunning ? "wait" : "pointer" }}
            >
              {isRunning ? (
                <>
                  <span className="pulse-dot warning" /> Running Benchmark...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Run Full Evaluation Suite
                </>
              )}
            </button>
          </div>
        </div>

        {/* Telemetry Cards: Show after run or default metrics */}
        <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>EVALUATION CASES</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginTop: "0.2rem" }}>
              {testCases.length} Real Discussions
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>10 core architectural domains</span>
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>SANDBOX CODE PASS RATE</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "0.2rem" }}>
              {runData ? `${runData.codePassRate}%` : "100% (Baseline)"}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Executed in Docker Sandbox</span>
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>RETRIEVAL HIT RATE</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "0.2rem" }}>
              {runData ? `${runData.retrievalHitRate}%` : "100% (Baseline)"}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Target doc in top-K citations</span>
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>AVERAGE LATENCY</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-purple)", marginTop: "0.2rem" }}>
              {runData ? `${runData.avgLatencyMs}ms` : "140ms (P50)"}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Retrieval + Sandbox execution</span>
          </div>
        </div>

        {/* Options Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={runSandbox}
                onChange={(e) => setRunSandbox(e.target.checked)}
                style={{ accentColor: "var(--accent-indigo)" }}
              />
              <span>Run Automated Docker Sandbox Verification</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>fastapi/fastapi Discussions</span>
            <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>Docker Hardened Test Runner</span>
          </div>
        </div>
      </div>

      {/* Main Split Content: Benchmark Dataset Explorer OR Live Run Results */}
      {runData ? (
        // Mode A: Displaying Live Run Results
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
              Benchmark Execution Results ({runData.passedTests}/{runData.totalTests} Passed in {runData.durationMs}ms)
            </h3>
            <button
              onClick={() => setRunData(null)}
              className="btn btn-secondary btn-sm"
            >
              &larr; View Benchmark Test Cases
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.5rem", alignItems: "start" }}>
            {/* Left Column: Test Results List */}
            <div className="glass-panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "680px", overflowY: "auto" }}>
              {runData.results.map((r, idx) => {
                const isSelected = selectedResultIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedResultIdx(idx)}
                    style={{
                      textAlign: "left",
                      background: isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.03)",
                      border: isSelected ? "1px solid var(--accent-indigo)" : "1px solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.75rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                      <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>
                        {r.category}
                      </span>
                      <div style={{ display: "flex", gap: "0.3rem" }}>
                        <span className={`badge ${r.retrievalHit ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.65rem" }}>
                          {r.retrievalHit ? "✓ Retrieval Hit" : "✗ Miss"}
                        </span>
                        <span className={`badge ${r.codePassed ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.65rem" }}>
                          {r.codePassed ? "✓ Sandbox Pass" : "✗ Fail"}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.825rem", color: isSelected ? "#fff" : "var(--text-secondary)", fontWeight: 600, lineHeight: "1.3" }}>
                      {r.question}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detailed Result Inspector */}
            {activeResult && (
              <div className="glass-panel" style={{ padding: "2rem" }}>
                <div style={{ paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <span className="badge badge-info">{activeResult.category}</span>
                    <span className="badge badge-success">Score: {activeResult.score}%</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                      Latency: {activeResult.latencyMs}ms
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                    {activeResult.question}
                  </h3>
                  {activeResult.targetDocPath && (
                    <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", marginTop: "0.3rem" }}>
                      Target Doc: {activeResult.targetDocPath}
                    </div>
                  )}
                </div>

                {/* Generated Answer */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <strong style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                    RAG GENERATED ANSWER
                  </strong>
                  <div className="code-box" style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", maxHeight: "240px", overflowY: "auto" }}>
                    {activeResult.generatedAnswer}
                  </div>
                </div>

                {/* Docker Sandbox Verification Output */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      DOCKER SANDBOX TEST EXECUTION
                    </strong>
                    <span className={`badge ${activeResult.codePassed ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                      {activeResult.codePassed ? "TEST SUITE PASSED" : "TEST FAILED"}
                    </span>
                  </div>
                  <div className="code-box" style={{ color: "#34d399", whiteSpace: "pre-wrap", maxHeight: "180px", overflowY: "auto" }}>
                    {activeResult.sandboxStdout || activeResult.sandboxStderr || "Execution completed."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Mode B: Browsing Curated Benchmark Test Cases
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
              Curated Test Cases Explorer (10 Real GitHub Discussions)
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.5rem", alignItems: "start" }}>
            {/* Left: Test Cases List */}
            <div className="glass-panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "680px", overflowY: "auto" }}>
              {testCases.map((tc, idx) => {
                const isSelected = selectedCaseIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCaseIdx(idx)}
                    style={{
                      textAlign: "left",
                      background: isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.03)",
                      border: isSelected ? "1px solid var(--accent-indigo)" : "1px solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.75rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                      <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>
                        #{tc.discussionNumber} • {tc.category}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.825rem", color: isSelected ? "#fff" : "var(--text-secondary)", fontWeight: 600, lineHeight: "1.3" }}>
                      {tc.question}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Detailed Test Case View */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <div style={{ paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span className="badge badge-purple">Discussion #{activeCase.discussionNumber}</span>
                    <span className="badge badge-info">{activeCase.category}</span>
                  </div>
                  <a
                    href={activeCase.discussionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem" }}
                  >
                    View on GitHub Discussions &nearr;
                  </a>
                </div>

                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", lineHeight: "1.3" }}>
                  {activeCase.question}
                </h3>
                <div style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", marginTop: "0.35rem" }}>
                  Ground-Truth Target: {activeCase.targetDocPath}
                </div>
              </div>

              {/* Reference Ground Truth Answer */}
              <div style={{ marginBottom: "1.75rem" }}>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                  MAINTAINER REFERENCE ANSWER
                </strong>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                  {activeCase.referenceAnswer}
                </p>
              </div>

              {/* Automated Python Verification Code */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <strong style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    DOCKER SANDBOX VERIFICATION TEST SCRIPT
                  </strong>
                  <Link href="/sandbox" className="badge badge-purple" style={{ textDecoration: "none" }}>
                    Run in Sandbox &rarr;
                  </Link>
                </div>
                <pre className="code-box" style={{ fontSize: "0.8rem", maxHeight: "260px", overflowY: "auto", margin: 0 }}>
                  <code>{activeCase.verificationCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
