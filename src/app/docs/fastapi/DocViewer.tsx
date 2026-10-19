"use client";

import { useState } from "react";

interface DocItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  path: string;
  githubUrl: string;
  excerpt: string | null;
  content: string;
  orderIndex: number;
}

interface SourceInfo {
  repo: string;
  branch: string;
  lastCommitSha: string | null;
  lastSyncAt: string | null;
  pagesCount: number;
  syncStatus: string;
}

export default function DocViewer({
  initialDocs,
  initialSource,
}: {
  initialDocs: DocItem[];
  initialSource: SourceInfo | null;
}) {
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [source, setSource] = useState<SourceInfo | null>(initialSource);
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocs.length > 0 ? initialDocs[0].id : ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Trigger manual sync with GitHub
  const handleSync = async (force: boolean = false) => {
    setIsSyncing(true);
    setSyncFeedback({ type: "info", message: "Fetching latest FastAPI docs from GitHub..." });

    try {
      const res = await fetch("/api/sync/fastapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();

      if (data.success) {
        setSyncFeedback({
          type: "success",
          message: `${data.message} (Commit ${data.commitSha ? data.commitSha.slice(0, 7) : "latest"})`,
        });

        // Refresh docs list
        const refreshedRes = await fetch("/api/docs/fastapi");
        const refreshedData = await refreshedRes.json();
        if (refreshedData.docs && refreshedData.docs.length > 0) {
          // If docs don't have full content from list endpoint, fetch selected doc
          setDocs(refreshedData.docs);
          if (!selectedDocId) {
            setSelectedDocId(refreshedData.docs[0].id);
          }
        }
        if (refreshedData.source) {
          setSource(refreshedData.source);
        }
      } else {
        setSyncFeedback({
          type: "error",
          message: data.message || "Failed to synchronize docs.",
        });
      }
    } catch (err: unknown) {
      setSyncFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error connecting to sync service.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter docs
  const filteredDocs = docs.filter((doc) => {
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || filteredDocs[0] || docs[0];

  // Helper to render basic markdown without external heavy parser
  const renderMarkdown = (content: string) => {
    if (!content) return null;

    const sections = content.split(/(```[\s\S]*?```)/g);

    return (
      <div style={{ lineHeight: "1.7", color: "var(--text-secondary)" }}>
        {sections.map((section, idx) => {
          if (section.startsWith("```")) {
            const firstLineBreak = section.indexOf("\n");
            const lang = section.slice(3, firstLineBreak).trim();
            const code = section.slice(firstLineBreak + 1, section.length - 3);

            return (
              <div key={idx} style={{ margin: "1.5rem 0" }}>
                {lang && (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "inline-block",
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.75rem",
                      borderRadius: "6px 6px 0 0",
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent-cyan)",
                      borderTop: "1px solid var(--border-color)",
                      borderLeft: "1px solid var(--border-color)",
                      borderRight: "1px solid var(--border-color)",
                    }}
                  >
                    {lang}
                  </div>
                )}
                <pre
                  className="code-box"
                  style={{
                    margin: 0,
                    borderRadius: lang ? "0 8px 8px 8px" : "8px",
                    overflowX: "auto",
                  }}
                >
                  <code>{code}</code>
                </pre>
              </div>
            );
          }

          // Format paragraphs, headers, bullet points
          const lines = section.split("\n");
          return (
            <div key={idx}>
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("# ")) {
                  return (
                    <h1
                      key={lIdx}
                      style={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        color: "#fff",
                        margin: "1.75rem 0 0.75rem 0",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {trimmed.replace(/^#\s+/, "")}
                    </h1>
                  );
                }
                if (trimmed.startsWith("## ")) {
                  return (
                    <h2
                      key={lIdx}
                      style={{
                        fontSize: "1.45rem",
                        fontWeight: 700,
                        color: "#fff",
                        margin: "1.5rem 0 0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        paddingBottom: "0.3rem",
                      }}
                    >
                      {trimmed.replace(/^##\s+/, "")}
                    </h2>
                  );
                }
                if (trimmed.startsWith("### ")) {
                  return (
                    <h3
                      key={lIdx}
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 600,
                        color: "#e2e8f0",
                        margin: "1.25rem 0 0.4rem 0",
                      }}
                    >
                      {trimmed.replace(/^###\s+/, "")}
                    </h3>
                  );
                }
                if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                  return (
                    <li
                      key={lIdx}
                      style={{
                        marginLeft: "1.5rem",
                        marginBottom: "0.3rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {trimmed.replace(/^[\*\-]\s+/, "")}
                    </li>
                  );
                }
                if (!trimmed) {
                  return <div key={lIdx} style={{ height: "0.75rem" }} />;
                }
                return (
                  <p key={lIdx} style={{ marginBottom: "0.75rem" }}>
                    {trimmed}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const categories = [
    { id: "all", label: "All Docs" },
    { id: "core", label: "Core Concepts" },
    { id: "tutorial", label: "Tutorial (User Guide)" },
    { id: "dependencies", label: "Dependencies" },
    { id: "security", label: "Security" },
    { id: "advanced", label: "Advanced Guide" },
    { id: "deployment", label: "Deployment & Docker" },
  ];

  return (
    <div>
      {/* Top Sync & Status Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "1.25rem 1.75rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="pulse-dot success" />
              <strong style={{ color: "#fff", fontSize: "1.1rem" }}>
                GitHub Ingestion Pipeline
              </strong>
              <span className="badge badge-info">tiangolo/fastapi</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Tracking branch <code>master</code> •{" "}
              {source?.lastCommitSha ? (
                <span>
                  Commit: <code>{source.lastCommitSha.slice(0, 7)}</code>
                </span>
              ) : (
                "Continuous sync active"
              )}{" "}
              • {docs.length} documentation pages ingested
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => handleSync(true)}
            disabled={isSyncing}
            className="btn btn-primary btn-sm"
            style={{ cursor: isSyncing ? "wait" : "pointer" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isSyncing ? "rotate(180deg)" : "none",
                transition: "transform 0.5s ease",
              }}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            {isSyncing ? "Syncing with GitHub..." : "Sync Now"}
          </button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            background:
              syncFeedback.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : syncFeedback.type === "error"
                ? "rgba(244, 63, 94, 0.15)"
                : "rgba(6, 182, 212, 0.15)",
            border: `1px solid ${
              syncFeedback.type === "success"
                ? "rgba(16, 185, 129, 0.3)"
                : syncFeedback.type === "error"
                ? "rgba(244, 63, 94, 0.3)"
                : "rgba(6, 182, 212, 0.3)"
            }`,
            color:
              syncFeedback.type === "success"
                ? "#34d399"
                : syncFeedback.type === "error"
                ? "#fb7185"
                : "#22d3ee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{syncFeedback.message}</span>
          <button
            onClick={() => setSyncFeedback(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Split View: Sidebar + Document Reader */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* Left Sidebar: Filters & Documents List */}
        <div
          className="glass-panel"
          style={{
            padding: "1.25rem",
            position: "sticky",
            top: "5.5rem",
            maxHeight: "calc(100vh - 7rem)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search Input */}
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search FastAPI docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: "0.6rem 0.85rem",
                color: "#fff",
                fontSize: "0.85rem",
                fontFamily: "var(--font-sans)",
                outline: "none",
              }}
            />
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.35rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background:
                    selectedCategory === cat.id
                      ? "var(--accent-indigo)"
                      : "rgba(255, 255, 255, 0.05)",
                  color: selectedCategory === cat.id ? "#fff" : "var(--text-secondary)",
                  border: "none",
                  borderRadius: "var(--radius-full)",
                  padding: "0.25rem 0.65rem",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: selectedCategory === cat.id ? 600 : 400,
                  transition: "all 0.15s ease",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Documents List */}
          <div
            style={{
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              paddingRight: "0.25rem",
            }}
          >
            {filteredDocs.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
                No documentation pages match your search.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    style={{
                      textAlign: "left",
                      background: isSelected
                        ? "rgba(99, 102, 241, 0.18)"
                        : "transparent",
                      border: isSelected
                        ? "1px solid rgba(99, 102, 241, 0.4)"
                        : "1px solid transparent",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.6rem 0.75rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        color: isSelected ? "var(--accent-cyan)" : "#e2e8f0",
                        fontSize: "0.85rem",
                        fontWeight: isSelected ? 600 : 500,
                        lineHeight: "1.3",
                      }}
                    >
                      {doc.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.725rem",
                        color: "var(--text-muted)",
                        marginTop: "0.2rem",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {doc.path}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content Area: Markdown Document Reader */}
        <div className="glass-panel" style={{ padding: "2.5rem" }}>
          {selectedDoc ? (
            <div>
              {/* Document Meta Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1rem",
                  paddingBottom: "1.5rem",
                  borderBottom: "1px solid var(--border-color)",
                  marginBottom: "2rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span>fastapi</span>
                    <span>/</span>
                    <span>docs</span>
                    <span>/</span>
                    <span style={{ color: "var(--accent-cyan)" }}>{selectedDoc.path}</span>
                  </div>
                  <h1
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.2",
                    }}
                  >
                    {selectedDoc.title}
                  </h1>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a
                    href={selectedDoc.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </div>

              {/* Rendered Markdown Body */}
              <article>{renderMarkdown(selectedDoc.content)}</article>

              {/* LMS Course Banner */}
              <div
                style={{
                  marginTop: "3.5rem",
                  padding: "1.5rem",
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <strong style={{ color: "#fff", display: "block", marginBottom: "0.2rem" }}>
                    🎓 Learn this via Interactive Course
                  </strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    This ingested document is automatically structured as a lesson in the EduTech Course Catalog.
                  </span>
                </div>
                <a href="/courses" className="btn btn-primary btn-sm">
                  View in Course Catalog &rarr;
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
              No document selected. Click &quot;Sync Now&quot; above to ingest FastAPI docs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
