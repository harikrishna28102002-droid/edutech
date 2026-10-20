import { Metadata } from "next";
import Link from "next/link";
import ModelComparisonDashboard from "./ModelComparisonDashboard";
import { getLatestComparison } from "@/lib/model-comparison";

export const metadata: Metadata = {
  title: "Base Models Comparison Benchmark — EduTech",
  description:
    "Head-to-head empirical comparison of base models (Local RAG Synthesizer, Llama 3 8B, GPT-4o Mini, Gemini 2.0 Flash, and Raw Base Ablation) on the 10 real FastAPI GitHub discussions evaluation set.",
};

export const dynamic = "force-dynamic";

export default async function ModelComparisonPage() {
  const comparison = await getLatestComparison();

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
        <Link href="/" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
          Platform Overview
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <Link href="/eval" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
          Evaluation Benchmark
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>Base Model Comparison</span>
      </div>

      {/* Main Comparison Dashboard */}
      <ModelComparisonDashboard initialComparison={comparison} />
    </div>
  );
}
