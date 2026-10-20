import type { Metadata } from "next";
import Link from "next/link";
import ApiDocsExplorer from "./ApiDocsExplorer";

export const metadata: Metadata = {
  title: "REST Backend API & OpenAPI 3.1 Explorer | EduTech Platform",
  description:
    "Interactive documentation and live test console for EduTech RESTful Backend API covering Courses, Curriculum, Enrollments, Progress Tracking, AI Hybrid Search, and Docker Sandbox.",
  keywords: [
    "EduTech API",
    "OpenAPI 3.1",
    "RESTful API",
    "Course Management API",
    "Next.js 16 API",
    "Prisma ORM",
    "PostgreSQL",
  ],
};

export default function ApiDocsPage() {
  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1rem" }}>
        <Link
          href="/"
          style={{
            color: "var(--accent-cyan)",
            textDecoration: "none",
            fontSize: "0.85rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          &larr; Back to Platform Overview
        </Link>
      </nav>

      {/* Hero Header */}
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <span className="badge badge-primary">RESTful Backend Architecture</span>
          <span className="badge badge-success">OpenAPI 3.1.0</span>
          <span className="badge" style={{ background: "rgba(147, 51, 234, 0.15)", color: "#c084fc", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
            Zero-Downtime Fallback Resilient
          </span>
        </div>
        <h1
          id="api-docs-heading"
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: "0.75rem",
          }}
        >
          Backend API &amp; <span className="gradient-text">Interactive Explorer</span>
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            maxWidth: "850px",
            lineHeight: 1.6,
          }}
        >
          Test and integrate EduTech enterprise APIs directly from your browser. Full CRUD support for Course Management,
          granular Curriculum Hierarchy, Student Learning &amp; Automatic Progress Aggregation, AI RAG Pipelines,
          and Docker Sandbox code execution.
        </p>
      </header>

      {/* Interactive API Explorer */}
      <section aria-labelledby="api-explorer-section">
        <h2 id="api-explorer-section" style={{ display: "none" }}>
          Interactive API Explorer Console
        </h2>
        <ApiDocsExplorer />
      </section>
    </main>
  );
}
