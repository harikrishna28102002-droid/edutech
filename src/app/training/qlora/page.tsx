import { Metadata } from "next";
import Link from "next/link";
import QLoRATrainingDashboard from "./QLoRATrainingDashboard";
import { getLatestQLoRARun, executeQLoRATraining } from "@/lib/qlora-trainer";

export const metadata: Metadata = {
  title: "FastAPI QLoRA Fine-Tuning Studio — EduTech",
  description:
    "Quantized Low-Rank Adaptation (QLoRA) fine-tuning engine using 4-bit NormalFloat (NF4) quantization on real FastAPI documentation training chunks.",
};

export const dynamic = "force-dynamic";

export default async function QLoRAPage() {
  let run = getLatestQLoRARun();
  if (!run) {
    run = await executeQLoRATraining();
  }

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
        <Link href="/" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
          Platform Overview
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <Link href="/training" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
          AI Training Studio
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>QLoRA Fine-Tune</span>
      </div>

      <QLoRATrainingDashboard initialRun={run} />
    </div>
  );
}
