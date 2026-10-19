import Link from "next/link";
import SearchPlayground from "./SearchPlayground";

export const metadata = {
  title: "Hybrid Search & Neural Reranking — EduTech",
  description:
    "Dense vector semantic search + sparse BM25 keyword matching fused with Reciprocal Rank Fusion (RRF) and contextual reranking over documentation chunks.",
};

export default function SearchPage() {
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
        <span style={{ color: "#fff", fontWeight: 600 }}>Hybrid Search &amp; Reranker</span>
      </div>

      {/* Main Title & Description */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">384-Dim Dense Vectors</span>
          <span className="badge badge-info">Okapi BM25 Sparse</span>
          <span className="badge badge-success">Reciprocal Rank Fusion (RRF)</span>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Hybrid Search &amp; Reranking Engine
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "800px", marginTop: "0.35rem" }}>
          Combines dense semantic vector retrieval with sparse lexical keyword matching, fused using Reciprocal Rank Fusion (RRF) and fine-grained contextual cross-score reranking.
        </p>
      </div>

      {/* Search Playground UI */}
      <SearchPlayground />
    </div>
  );
}
