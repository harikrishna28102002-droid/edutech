import Link from "next/link";
import AnswerAssistant from "./AnswerAssistant";

export const metadata = {
  title: "AI Answer Pipeline & Model Serving — EduTech",
  description:
    "Real-time RAG (Retrieval-Augmented Generation) answer pipeline powered by Hybrid Search, Neural Reranking, and the Universal Model Gateway.",
};

export default function AskPage() {
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
        <span style={{ color: "#fff", fontWeight: 600 }}>RAG Answer Pipeline</span>
      </div>

      {/* Main Title & Description */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">Model Serving Gateway</span>
          <span className="badge badge-success">Grounded Citations</span>
          <span className="badge badge-info">Real-Time Streaming</span>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          AI Answer Pipeline
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "800px", marginTop: "0.35rem" }}>
          Ask complex architectural and implementation questions. Answers are dynamically synthesized from relevant documentation chunks retrieved via Hybrid Search and verified with numbered citations.
        </p>
      </div>

      {/* Answer Assistant Component */}
      <AnswerAssistant />
    </div>
  );
}
