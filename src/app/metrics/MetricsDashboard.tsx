"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlatformMetricsTelemetry } from "@/lib/metrics-service";

interface Props {
  initialMetrics: PlatformMetricsTelemetry;
}

export default function MetricsDashboard({ initialMetrics }: Props) {
  const [metrics, setMetrics] = useState<PlatformMetricsTelemetry>(initialMetrics);
  const [activeTab, setActiveTab] = useState<"eval" | "sync" | "lms" | "system">("eval");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [isRunningSync, setIsRunningSync] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Fetch updated metrics
  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        showStatus("success", "Telemetry updated.");
      }
    } catch (err) {
      showStatus("error", "Failed to refresh telemetry.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Trigger evaluation suite
  const handleTriggerEval = async () => {
    setIsRunningEval(true);
    try {
      const res = await fetch("/api/eval/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelProvider: "local", runSandboxTests: true }),
      });

      if (res.ok) {
        await refreshMetrics();
        showStatus("success", "Evaluation benchmark completed successfully!");
      }
    } catch (err) {
      showStatus("error", "Evaluation run failed.");
    } finally {
      setIsRunningEval(false);
    }
  };

  // Trigger daily sync
  const handleTriggerSync = async () => {
    setIsRunningSync(true);
    try {
      const res = await fetch("/api/sync/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true, reembed: true }),
      });

      if (res.ok) {
        await refreshMetrics();
        showStatus("success", "Daily sync and embedding generation completed!");
      }
    } catch (err) {
      showStatus("error", "Daily sync failed.");
    } finally {
      setIsRunningSync(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metrics, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `edutech-telemetry-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatUptime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Toast Alert */}
      {statusMessage && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background: statusMessage.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
            border: statusMessage.type === "success" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
            color: statusMessage.type === "success" ? "#10b981" : "#ef4444",
            fontWeight: 600,
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Top Operations Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          padding: "1.75rem 2rem",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span className="badge badge-primary">Platform Operations &amp; Telemetry</span>
            <span className="badge badge-success">Live Health</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            System Metrics &amp; Sync Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.3rem", fontSize: "0.95rem" }}>
            Real-time telemetry tracking evaluation benchmark runs, daily documentation sync jobs, and LMS operations.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleTriggerEval}
            disabled={isRunningEval}
            className="btn btn-primary btn-sm"
          >
            {isRunningEval ? "Running Evals..." : "▶ Run Evaluation Suite"}
          </button>

          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isRunningSync}
            className="btn btn-secondary btn-sm"
          >
            {isRunningSync ? "Syncing..." : "⚡ Trigger Daily Sync"}
          </button>

          <button
            type="button"
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="btn btn-secondary btn-sm"
            title="Refresh Telemetry"
          >
            {isRefreshing ? "..." : "🔄 Refresh"}
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="btn btn-outline btn-sm"
          >
            📥 Export JSON
          </button>
        </div>
      </div>

      {/* 4 Primary Health Gauges */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Gauge 1: Evaluation Benchmark */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Evaluation Pass Rate
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: metrics.evaluation.passRateDelta >= 0 ? "#10b981" : "#ef4444",
              }}
            >
              {metrics.evaluation.passRateDelta >= 0 ? `+${metrics.evaluation.passRateDelta}%` : `${metrics.evaluation.passRateDelta}%`}
            </span>
          </div>
          <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--accent-cyan)", margin: "0.4rem 0" }}>
            {metrics.evaluation.latestPassRate}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Latency: <strong>{metrics.evaluation.latestAvgLatencyMs}ms</strong> • Sandbox: <strong>{metrics.evaluation.latestCodePassRate}%</strong>
          </div>
        </div>

        {/* Gauge 2: Documentation Sync Status */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Daily Sync Status
            </span>
            <span
              className={`badge ${
                metrics.sync.freshness === "FRESH" ? "badge-success" : "badge-warning"
              }`}
              style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}
            >
              {metrics.sync.freshness}
            </span>
          </div>
          <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--accent-emerald)", margin: "0.4rem 0" }}>
            {metrics.sync.totalPages} <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--text-secondary)" }}>pages</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Chunks: <strong>{metrics.sync.totalChunks}</strong> • Last sync: <strong>{metrics.sync.hoursSinceLastSync}h ago</strong>
          </div>
        </div>

        {/* Gauge 3: System Infrastructure */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Database &amp; Uptime
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: metrics.system.dbStatus === "CONNECTED" ? "#10b981" : "#f59e0b",
              }}
            >
              {metrics.system.dbStatus} ({metrics.system.dbLatencyMs}ms)
            </span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", margin: "0.4rem 0" }}>
            {formatUptime(metrics.system.uptimeSeconds)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Memory RSS: <strong>{metrics.system.memoryUsageMb.rss} MB</strong> (Heap: {metrics.system.memoryUsageMb.heapUsed} MB)
          </div>
        </div>

        {/* Gauge 4: LMS Learning Platform */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
              Learning Enrollment
            </span>
            <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700 }}>
              ★ {metrics.lms.averageRating}
            </span>
          </div>
          <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#a855f7", margin: "0.4rem 0" }}>
            {metrics.lms.totalEnrollments} <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--text-secondary)" }}>enrolled</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Courses: <strong>{metrics.lms.totalCourses}</strong> • Active Learners: <strong>{metrics.lms.activeStudents}</strong>
          </div>
        </div>
      </div>

      {/* Main Tabbed Operations Console */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
          {[
            { id: "eval", label: "📊 Evaluation Benchmarks & Trends" },
            { id: "sync", label: "⚡ Daily Sync History & Ingestion" },
            { id: "lms", label: "🎓 LMS Business & Learning Stats" },
            { id: "system", label: "💻 System & Infrastructure Telemetry" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: activeTab === tab.id ? "rgba(99, 102, 241, 0.2)" : "transparent",
                color: activeTab === tab.id ? "var(--accent-primary)" : "var(--text-secondary)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Evaluation Benchmarks */}
        {activeTab === "eval" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Historical runs table */}
            <div className="glass-panel" style={{ padding: "1.5rem", overflowX: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Historical Evaluation Runs ({metrics.evaluation.runs.length})
                </h3>
                <Link href="/eval" style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", textDecoration: "none" }}>
                  View Full Evaluation Suite &rarr;
                </Link>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Run ID</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Model</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Pass Rate</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Sandbox Code</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Retrieval Hit</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Avg Latency</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.evaluation.runs.map((r, i) => (
                    <tr key={r.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "0.65rem 0.5rem", fontFamily: "monospace", color: "var(--accent-cyan)" }}>
                        {r.id.slice(0, 16)}...
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>{r.modelProvider}</td>
                      <td style={{ padding: "0.65rem 0.5rem", fontWeight: 700, color: r.passRate >= 70 ? "#10b981" : "#ef4444" }}>
                        {r.passRate}%
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>{r.codePassRate}%</td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>{r.retrievalHitRate}%</td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>{r.avgLatencyMs}ms</td>
                      <td style={{ padding: "0.65rem 0.5rem", color: "var(--text-muted)" }}>
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Daily Sync History */}
        {activeTab === "sync" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="glass-panel" style={{ padding: "1.25rem" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Source Repository
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem", color: "#ffffff" }}>
                  tiangolo/fastapi (master)
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem", fontFamily: "monospace" }}>
                  Commit: {metrics.sync.lastCommitSha.slice(0, 12)}...
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "1.25rem" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Next Scheduled Sync
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem", color: "var(--accent-primary)" }}>
                  {new Date(metrics.sync.nextScheduledAt).toLocaleString()}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  Cadence: Daily at 02:00 UTC
                </div>
              </div>
            </div>

            {/* Sync logs table */}
            <div className="glass-panel" style={{ padding: "1.5rem", overflowX: "auto" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
                Synchronization Audit History
              </h3>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Timestamp</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Status</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Pages Added / Updated</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Total Ingested</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Duration</th>
                    <th style={{ padding: "0.6rem 0.5rem" }}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.sync.recentSyncLogs.map((log, i) => (
                    <tr key={log.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "0.65rem 0.5rem", color: "var(--text-primary)" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>
                        <span
                          className={`badge ${log.status === "SUCCESS" ? "badge-success" : "badge-warning"}`}
                          style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>
                        +{log.addedCount} / ~{log.updatedCount}
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem", fontWeight: 700 }}>{log.totalCount}</td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>{log.durationMs}ms</td>
                      <td style={{ padding: "0.65rem 0.5rem", color: "var(--text-secondary)" }}>
                        {log.message || "Sync completed successfully."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: LMS Learning Stats */}
        {activeTab === "lms" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Course &amp; Content Architecture
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Published Courses:</span>
                  <strong>{metrics.lms.totalCourses}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Total Lessons:</span>
                  <strong>{metrics.lms.totalLessons}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Average Course Rating:</span>
                  <strong style={{ color: "#f59e0b" }}>★ {metrics.lms.averageRating}</strong>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Community &amp; Student Adoption
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Active Learners:</span>
                  <strong>{metrics.lms.activeStudents}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Course Instructors:</span>
                  <strong>{metrics.lms.totalInstructors}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Course Completion Rate:</span>
                  <strong style={{ color: "var(--accent-emerald)" }}>{metrics.lms.completionRate}%</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System Telemetry */}
        {activeTab === "system" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Process Memory Allocation
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>RSS Memory:</span>
                  <strong>{metrics.system.memoryUsageMb.rss} MB</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Heap Used:</span>
                  <strong>{metrics.system.memoryUsageMb.heapUsed} MB</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Heap Total:</span>
                  <strong>{metrics.system.memoryUsageMb.heapTotal} MB</strong>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Environment &amp; Runtime
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Node.js Version:</span>
                  <code>{metrics.system.nodeVersion}</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Operating System:</span>
                  <code>{metrics.system.platform}</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Database Status:</span>
                  <strong style={{ color: metrics.system.dbStatus === "CONNECTED" ? "#10b981" : "#f59e0b" }}>
                    {metrics.system.dbStatus}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
