"use client";

import { useState } from "react";
import Link from "next/link";

interface CitationSource {
  index: number;
  title: string;
  path: string;
  url: string;
  snippet?: string;
  score?: number;
}

export default function AnswerAssistant() {
  const [question, setQuestion] = useState(
    "How do I implement Dependency Injection in FastAPI using Depends?"
  );
  const [modelProvider, setModelProvider] = useState<"auto" | "local" | "ollama" | "openai" | "gemini">("auto");
  const [isGenerating, setIsGenerating] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<CitationSource[]>([]);
  const [metrics, setMetrics] = useState<{
    retrievalMs?: number;
    totalMs?: number;
    tokenCount?: number;
    provider?: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const sampleQuestions = [
    "How do I implement Dependency Injection in FastAPI using Depends?",
    "How do path parameters work with type validation?",
    "How do I deploy FastAPI in a Docker container for production?",
    "When should I use async def vs normal def in FastAPI endpoints?",
  ];

  const handleAsk = async (customQ?: string) => {
    const q = customQ ?? question;
    if (!q.trim() || isGenerating) return;

    setIsGenerating(true);
    setAnswer("");
    setSources([]);
    setMetrics(null);

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          modelProvider,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to start generation stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "citation" && event.metadata?.sources) {
                setSources(event.metadata.sources);
                if (event.metadata.retrievalMs) {
                  setMetrics((prev) => ({ ...prev, retrievalMs: event.metadata.retrievalMs }));
                }
              } else if (event.type === "token" && event.content) {
                setAnswer((prev) => prev + event.content);
              } else if (event.type === "done") {
                setMetrics((prev) => ({
                  ...prev,
                  tokenCount: event.metadata?.tokenCount,
                  provider: event.metadata?.provider,
                  totalMs: event.metadata?.totalMs,
                }));
              }
            } catch {
              // Ignore malformed chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      setAnswer(
        `❌ Error generating answer: ${err instanceof Error ? err.message : "Unknown connection error"}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Basic Markdown Renderer for the streaming answer
  const renderAnswer = (content: string) => {
    const sections = content.split(/(```[\s\S]*?```)/g);

    return (
      <div style={{ lineHeight: "1.75", color: "var(--text-secondary)", fontSize: "0.975rem" }}>
        {sections.map((section, idx) => {
          if (section.startsWith("```")) {
            const firstLineBreak = section.indexOf("\n");
            const lang = section.slice(3, firstLineBreak).trim() || "python";
            const code = section.slice(firstLineBreak + 1, section.length - 3).trim();

            return (
              <div
                key={idx}
                style={{
                  margin: "1.5rem 0",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: "#04060a",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.45rem 1rem",
                    background: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid var(--border-color)",
                    fontSize: "0.75rem",
                    color: "var(--accent-cyan)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span>{lang.toUpperCase()}</span>
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    <Link
                      href="/sandbox"
                      style={{
                        background: "rgba(99, 102, 241, 0.15)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        color: "#c084fc",
                        borderRadius: "4px",
                        padding: "0.15rem 0.5rem",
                        fontSize: "0.725rem",
                        textDecoration: "none",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <span>⚡</span> Run in Sandbox
                    </Link>
                    <button
                      onClick={() => copyToClipboard(code, `code-${idx}`)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      {copiedCode === `code-${idx}` ? (
                        <span style={{ color: "var(--accent-emerald)" }}>✓ Copied</span>
                      ) : (
                        "Copy Code"
                      )}
                    </button>
                  </div>
                </div>
                <pre style={{ margin: 0, padding: "1rem", overflowX: "auto", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#e2e8f0" }}>
                  <code>{code}</code>
                </pre>
              </div>
            );
          }

          const lines = section.split("\n");
          return (
            <div key={idx}>
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("### ")) {
                  return (
                    <h3 key={lIdx} style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: "1.5rem 0 0.5rem 0" }}>
                      {trimmed.replace(/^###\s+/, "")}
                    </h3>
                  );
                }
                if (trimmed.startsWith("#### ")) {
                  return (
                    <h4 key={lIdx} style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--accent-cyan)", margin: "1.25rem 0 0.4rem 0" }}>
                      {trimmed.replace(/^####\s+/, "")}
                    </h4>
                  );
                }
                if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed)) {
                  return (
                    <li key={lIdx} style={{ marginLeft: "1.5rem", marginBottom: "0.35rem", color: "var(--text-secondary)" }}>
                      {trimmed.replace(/^(\*|\-|\d+\.)\s+/, "")}
                    </li>
                  );
                }
                if (!trimmed) return <div key={lIdx} style={{ height: "0.5rem" }} />;
                return <p key={lIdx} style={{ marginBottom: "0.75rem" }}>{trimmed}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Question Input Card */}
      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          style={{ marginBottom: "1.25rem" }}
        >
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.6rem", fontWeight: 600 }}>
            ASK TECHNICAL QUESTION TO RAG PIPELINE
          </label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about FastAPI architecture, dependencies, or Docker..."
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.9rem 1rem 0.9rem 2.75rem",
                  color: "#fff",
                  fontSize: "1rem",
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                }}
              />
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ minWidth: "150px", cursor: isGenerating ? "wait" : "pointer" }}
            >
              {isGenerating ? (
                <>
                  <span className="pulse-dot warning" /> Synthesizing...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Run Pipeline
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Suggested:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(q);
                handleAsk(q);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-full)",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Model Provider Selector */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>MODEL SERVER:</span>
            <div
              style={{
                display: "inline-flex",
                background: "rgba(0,0,0,0.3)",
                padding: "3px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              {(["auto", "local", "ollama", "openai"] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setModelProvider(prov)}
                  style={{
                    background: modelProvider === prov ? "var(--accent-indigo)" : "transparent",
                    color: modelProvider === prov ? "#fff" : "var(--text-secondary)",
                    border: "none",
                    padding: "0.3rem 0.7rem",
                    fontSize: "0.775rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {prov === "auto" ? "⚡ Local RAG Gateway" : prov.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <span className="badge badge-success">
            <span className="pulse-dot success" />
            Model Serving Online
          </span>
        </div>
      </div>

      {/* Main Response Area: Answer Stream + Citations Panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sources.length > 0 ? "1fr 320px" : "1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* Left: Answer Streaming Canvas */}
        <div className="glass-panel" style={{ padding: "2.5rem" }}>
          {/* Answer Header & Metrics */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--border-color)",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--gradient-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <strong style={{ color: "#fff", fontSize: "1.1rem" }}>
                AI Synthesized Response
              </strong>
            </div>

            {metrics && (
              <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.775rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                <span>Retrieval: {metrics.retrievalMs}ms</span>
                {metrics.totalMs && <span>Total: {metrics.totalMs}ms</span>}
                {metrics.tokenCount && <span>~{metrics.tokenCount} tokens</span>}
              </div>
            )}
          </div>

          {/* Generated Text Canvas */}
          {answer ? (
            <div>
              {renderAnswer(answer)}
              {isGenerating && (
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "16px",
                    background: "var(--accent-cyan)",
                    marginLeft: "4px",
                    verticalAlign: "middle",
                    animation: "pulse 1s infinite",
                  }}
                />
              )}
            </div>
          ) : isGenerating ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
              <span className="pulse-dot warning" style={{ display: "inline-block", marginRight: "8px" }} />
              Retrieving context chunks via Hybrid Search &amp; serving model...
            </div>
          ) : (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
              Enter a question above or click one of the suggested prompts to run the answer pipeline.
            </div>
          )}
        </div>

        {/* Right: Retrieved Citation Sources Drawer */}
        {sources.length > 0 && (
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <span className="badge badge-info" style={{ fontSize: "0.75rem" }}>
                Grounded Citations
              </span>
              <strong style={{ color: "#fff", fontSize: "0.95rem" }}>
                {sources.length} Context Sources
              </strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sources.map((src) => (
                <div
                  key={src.index}
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                    <span
                      style={{
                        background: "var(--accent-indigo)",
                        color: "#fff",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.1rem 0.4rem",
                        borderRadius: "3px",
                      }}
                    >
                      [{src.index}]
                    </span>
                    <strong style={{ fontSize: "0.85rem", color: "#fff", lineHeight: "1.2" }}>
                      {src.title}
                    </strong>
                  </div>

                  <div style={{ fontSize: "0.725rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", marginBottom: "0.5rem" }}>
                    {src.path}
                  </div>

                  {src.snippet && (
                    <p style={{ fontSize: "0.775rem", color: "var(--text-secondary)", marginBottom: "0.6rem", lineHeight: "1.4" }}>
                      {src.snippet}
                    </p>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.725rem" }}>
                    <Link href={`/docs/fastapi`} style={{ color: "var(--accent-indigo)", textDecoration: "none" }}>
                      Open in Docs Hub &rarr;
                    </Link>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--text-muted)", textDecoration: "none" }}
                    >
                      GitHub &nearr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
