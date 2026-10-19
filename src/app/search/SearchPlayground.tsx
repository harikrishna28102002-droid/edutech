"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface SearchResultChunk {
  chunkId: string;
  pageId: string;
  docTitle: string;
  docSlug: string;
  docPath: string;
  category: string;
  githubUrl: string;
  heading: string | null;
  headingPath: string | null;
  content: string;
  snippet: string;
  denseScore: number;
  sparseScore: number;
  rrfScore: number;
  finalScore: number;
  denseRank: number;
  sparseRank: number;
  matchHighlights: string[];
}

interface SearchResponse {
  query: string;
  mode: "hybrid" | "vector" | "keyword";
  isReranked: boolean;
  totalCandidates: number;
  returnedCount: number;
  timings: {
    denseMs: number;
    sparseMs: number;
    fusionMs: number;
    rerankMs: number;
    totalMs: number;
  };
  results: SearchResultChunk[];
}

export default function SearchPlayground() {
  const [query, setQuery] = useState("How to use Dependency Injection with Depends");
  const [mode, setMode] = useState<"hybrid" | "vector" | "keyword">("hybrid");
  const [rerank, setRerank] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    "How to use Dependency Injection with Depends",
    "Path parameters with type validation in Python",
    "Deploy FastAPI in Docker container with uvicorn",
    "Async def endpoints and concurrency",
    "Pydantic data validation and request body",
  ];

  const executeSearch = useCallback(async (searchQuery?: string) => {
    const q = searchQuery ?? query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          mode,
          rerank,
          limit: 10,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "Search execution failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect to search service.");
    } finally {
      setLoading(false);
    }
  }, [query, mode, rerank]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  return (
    <div>
      {/* Search Bar & Controls Panel */}
      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch();
          }}
          style={{ marginBottom: "1.25rem" }}
        >
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FastAPI docs using hybrid vector + keyword search..."
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem 0.85rem 2.75rem",
                  color: "#fff",
                  fontSize: "1rem",
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: "130px" }}>
              {loading ? (
                <>
                  <span className="pulse-dot warning" /> Searching...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Hybrid Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Sample Queries */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Try queries:</span>
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sample);
                executeSearch(sample);
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
              {sample}
            </button>
          ))}
        </div>

        {/* Controls: Mode & Reranking */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          {/* Mode Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.825rem", color: "var(--text-muted)", fontWeight: 600 }}>SEARCH ENGINE:</span>
            <div
              style={{
                display: "inline-flex",
                background: "rgba(0,0,0,0.3)",
                padding: "3px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              <button
                type="button"
                onClick={() => setMode("hybrid")}
                style={{
                  background: mode === "hybrid" ? "var(--accent-indigo)" : "transparent",
                  color: mode === "hybrid" ? "#fff" : "var(--text-secondary)",
                  border: "none",
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.8rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                ⚡ Hybrid (RRF)
              </button>
              <button
                type="button"
                onClick={() => setMode("vector")}
                style={{
                  background: mode === "vector" ? "var(--accent-indigo)" : "transparent",
                  color: mode === "vector" ? "#fff" : "var(--text-secondary)",
                  border: "none",
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.8rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                🧠 Dense Vector (Cosine)
              </button>
              <button
                type="button"
                onClick={() => setMode("keyword")}
                style={{
                  background: mode === "keyword" ? "var(--accent-indigo)" : "transparent",
                  color: mode === "keyword" ? "#fff" : "var(--text-secondary)",
                  border: "none",
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.8rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                🔍 Sparse Keyword (BM25)
              </button>
            </div>
          </div>

          {/* Reranker Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontSize: "0.825rem",
                color: "var(--text-secondary)",
              }}
            >
              <input
                type="checkbox"
                checked={rerank}
                onChange={(e) => setRerank(e.target.checked)}
                style={{ accentColor: "var(--accent-indigo)", width: "16px", height: "16px" }}
              />
              <span style={{ fontWeight: 600, color: "#fff" }}>Contextual Reranking</span>
            </label>
            <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>
              Exact Phrase + Heading Boost
            </span>
          </div>
        </div>
      </div>

      {/* Latency & Timings Telemetry Bar */}
      {data && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1.75rem",
            padding: "0.75rem 1.25rem",
            background: "rgba(0,0,0,0.25)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="badge badge-success">
              <span className="pulse-dot success" /> {data.timings.totalMs}ms total latency
            </span>
            <span>
              Evaluated <strong>{data.totalCandidates}</strong> chunks across documentation corpus
            </span>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontFamily: "var(--font-mono)" }}>
            <span>Dense: {data.timings.denseMs}ms</span>
            <span>Sparse: {data.timings.sparseMs}ms</span>
            <span>RRF Fusion: {data.timings.fusionMs}ms</span>
            <span>Rerank: {data.timings.rerankMs}ms</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#fb7185",
            marginBottom: "2rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Results List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {data && data.results.length > 0 ? (
          data.results.map((result, idx) => {
            const scorePercent = Math.round(result.finalScore * 100);

            return (
              <div
                key={result.chunkId}
                className="glass-panel"
                style={{
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Header Row: Rank, Document path, Confidence Score */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span
                        style={{
                          background: "var(--gradient-brand)",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <span style={{ fontSize: "0.775rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                        {result.docPath}
                      </span>
                      <span className="badge badge-purple">{result.category}</span>
                    </div>

                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                      {result.heading || result.docTitle}
                    </h3>
                    {result.headingPath && (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {result.headingPath}
                      </span>
                    )}
                  </div>

                  {/* Confidence Badge */}
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: scorePercent > 80 ? "var(--accent-emerald)" : scorePercent > 60 ? "var(--accent-cyan)" : "var(--accent-amber)",
                      }}
                    >
                      {scorePercent}%
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Relevance Score
                    </span>
                  </div>
                </div>

                {/* Algorithmic Breakdown Pill Row */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.75rem" }}>
                  <span style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--text-secondary)" }}>
                    Dense Cosine: <strong>{result.denseScore}</strong> (Rank #{result.denseRank})
                  </span>
                  <span style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--text-secondary)" }}>
                    BM25 Sparse: <strong>{result.sparseScore}</strong> (Rank #{result.sparseRank})
                  </span>
                  <span style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--text-secondary)" }}>
                    RRF Score: <strong>{result.rrfScore}</strong>
                  </span>
                </div>

                {/* Highlighted Snippet */}
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {result.snippet}
                </p>

                {/* Match Highlight Tags & Action Links */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "0.85rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Matched terms:</span>
                    {result.matchHighlights.map((term, tIdx) => (
                      <span key={tIdx} className="badge badge-info" style={{ fontSize: "0.7rem" }}>
                        {term}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/docs/fastapi`} className="btn btn-secondary btn-sm">
                      Read in Docs Hub &rarr;
                    </Link>
                    <a
                      href={result.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem" }}
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : !loading && data ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No relevant chunks found matching &quot;{query}&quot;. Try adjusting your query or search mode.
          </div>
        ) : null}
      </div>
    </div>
  );
}
