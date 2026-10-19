import Link from "next/link";
import EvaluationDashboard from "./EvaluationDashboard";
import { GITHUB_DISCUSSIONS_EVAL_SET } from "@/lib/eval-dataset";

export const metadata = {
  title: "Evaluation Benchmark Suite — EduTech",
  description:
    "Evaluation dataset sourced from real GitHub discussions on tiangolo/fastapi with ground-truth reference answers, automated Docker sandbox test assertions, and retrieval scoring.",
};

export default function EvalPage() {
  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
        <Link href="/" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
          Platform Overview
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "var(--text-secondary)" }}>AI &amp; Retrieval Engine</span>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>Evaluation Benchmark</span>
      </div>

      {/* Main Title & Description */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">Real GitHub Discussions</span>
          <span className="badge badge-success">Automated Sandbox Tests</span>
          <span className="badge badge-info">RAG Triad Metrics</span>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Evaluation Benchmark Suite
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "800px", marginTop: "0.35rem" }}>
          Empirical evaluation benchmark built from real developer discussions on GitHub. Validates retrieval hit rates against ground-truth docs and tests generated Python implementations inside the Docker Sandbox.
        </p>
      </div>

      {/* Evaluation Dashboard Component */}
      <EvaluationDashboard initialCases={GITHUB_DISCUSSIONS_EVAL_SET} />
    </div>
  );
}
