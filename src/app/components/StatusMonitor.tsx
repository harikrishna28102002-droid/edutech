"use client";

import { useState, useEffect } from "react";

interface HealthData {
  status: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    provider: string;
    status: string;
    latencyMs: number;
    error: string | null;
    counts: {
      users: number;
      courses: number;
      lessons: number;
      enrollments: number;
    };
  };
  docker: {
    services: string[];
    network: string;
  };
}

export default function StatusMonitor() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const json = await res.json();
      setData(json);
      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isDbConnected = data?.database?.status === "connected";

  return (
    <div className="glass-panel" style={{ padding: "1.75rem", marginBottom: "2.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className={`pulse-dot ${isDbConnected ? "success" : "warning"}`} />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Live System &amp; Database Diagnostics
            </h3>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Real-time health telemetry across Next.js app runtime, Docker networking, and PostgreSQL database.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {lastChecked && (
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Updated {lastChecked}
            </span>
          )}
          <button
            onClick={checkHealth}
            disabled={isRefreshing}
            className="btn btn-secondary btn-sm"
            style={{ cursor: isRefreshing ? "wait" : "pointer" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isRefreshing ? "rotate(180deg)" : "none",
                transition: "transform 0.5s ease",
              }}
            >
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            {isRefreshing ? "Testing..." : "Test Connection"}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
          Checking system connection status...
        </div>
      ) : (
        <div className="grid-4">
          {/* Card 1: Database Status */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
              DATABASE ENGINE
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                PostgreSQL 16
              </div>
              <span className={`badge ${isDbConnected ? "badge-success" : "badge-warning"}`}>
                {isDbConnected ? "ONLINE" : "READY TO CONNECT"}
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              {isDbConnected
                ? `Latency: ${data?.database?.latencyMs}ms • Port 5432`
                : "Awaiting `docker compose up -d`"}
            </div>
          </div>

          {/* Card 2: Prisma Models Count */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
              ORCHESTRATED TABLES
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
              {isDbConnected ? `${data?.database?.counts.courses} Courses / ${data?.database?.counts.lessons} Lessons` : "8 Prisma Models"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Users, Courses, Modules, Lessons, Enrollments
            </div>
          </div>

          {/* Card 3: App Runtime */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
              APP RUNTIME
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                Next.js 16 Standalone
              </div>
              <span className="badge badge-info">App Router</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Uptime: {Math.floor(data?.uptimeSeconds ?? 0)}s • Port 3000
            </div>
          </div>

          {/* Card 4: Docker Stack */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
              DOCKER TOPOLOGY
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
              2 Services + 1 Tool
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              `edutech-app` • `edutech-db`
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
