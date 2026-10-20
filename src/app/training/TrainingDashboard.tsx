"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrainingDatasetSummary,
  GeneratedTrainingSample,
  DatasetFormat,
  DataSplit,
  formatAsAlpaca,
  formatAsChatML,
  formatAsDPO,
  formatAsRetrievalTriplet,
} from "@/lib/training-generator";

export default function TrainingDashboard({
  initialDatasets,
}: {
  initialDatasets: TrainingDatasetSummary[];
}) {
  const [datasets, setDatasets] = useState<TrainingDatasetSummary[]>(initialDatasets);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    initialDatasets[0]?.id || ""
  );
  const [selectedSampleIdx, setSelectedSampleIdx] = useState<number>(0);
  const [previewTab, setPreviewTab] = useState<DatasetFormat | "JSONL">("ALPACA");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [splitFilter, setSplitFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Generation Modal / Controls State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genFormat, setGenFormat] = useState<DatasetFormat>("ALPACA");
  const [genCount, setGenCount] = useState<number>(40);
  const [trainRatio, setTrainRatio] = useState<number>(0.8);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeDataset =
    datasets.find((d) => d.id === selectedDatasetId) || datasets[0] || null;

  // Filter samples
  const filteredSamples = (activeDataset?.samples || []).filter((s) => {
    if (categoryFilter !== "ALL" && s.category !== categoryFilter) return false;
    if (splitFilter !== "ALL" && s.split !== splitFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inInstruct = s.instruction.toLowerCase().includes(q);
      const inOutput = s.outputResponse.toLowerCase().includes(q);
      const inDoc = s.sourceDocPath.toLowerCase().includes(q);
      if (!inInstruct && !inOutput && !inDoc) return false;
    }
    return true;
  });

  const activeSample = filteredSamples[selectedSampleIdx] || filteredSamples[0] || null;

  // Trigger dataset generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage("Synthesizing training samples from real documentation chunks...");

    try {
      const res = await fetch("/api/training/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: genFormat,
          maxSamples: genCount,
          trainRatio,
          valRatio: Number(((1 - trainRatio) / 2).toFixed(2)),
          testRatio: Number(((1 - trainRatio) / 2).toFixed(2)),
        }),
      });

      const data = await res.json();
      if (data.success && data.dataset) {
        setDatasets((prev) => [data.dataset, ...prev]);
        setSelectedDatasetId(data.dataset.id);
        setSelectedSampleIdx(0);
        setStatusMessage(
          `Successfully generated ${data.dataset.totalSamples} training samples across ${data.dataset.trainCount} train, ${data.dataset.valCount} val, and ${data.dataset.testCount} test!`
        );
      } else {
        setStatusMessage("Failed to generate dataset. Please check server logs.");
      }
    } catch (err: unknown) {
      setStatusMessage("Error generating dataset.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper for previewing sample in active format
  const getSamplePreviewCode = (sample: GeneratedTrainingSample | null) => {
    if (!sample) return "// No sample selected";
    switch (previewTab) {
      case "CHATML":
        return JSON.stringify(formatAsChatML(sample), null, 2);
      case "DPO":
        return JSON.stringify(formatAsDPO(sample), null, 2);
      case "RETRIEVAL_TRIPLET":
        return JSON.stringify(formatAsRetrievalTriplet(sample), null, 2);
      case "JSONL":
        return (
          JSON.stringify(formatAsAlpaca(sample)) +
          "\n" +
          JSON.stringify(formatAsChatML(sample))
        );
      case "ALPACA":
      default:
        return JSON.stringify(formatAsAlpaca(sample), null, 2);
    }
  };

  const categories = Array.from(
    new Set((activeDataset?.samples || []).map((s) => s.category))
  );

  return (
    <div style={{ maxWidth: "1380px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <span className="badge badge-purple" style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}>
                🧠 LLM Fine-Tuning Pipeline
              </span>
              <span className="badge badge-cyan" style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}>
                Real FastAPI Chunks
              </span>
            </div>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginBottom: "0.5rem" }}>
              Training Data Studio
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "840px" }}>
              Extracts real technical chunks from official FastAPI documentation to synthesize high-quality instruction-tuning pairs (Alpaca), conversational dialogues (ChatML), preference pairs (DPO), and dense retrieval triplets.
            </p>
          </div>
          <Link href="/training/qlora" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", padding: "0.65rem 1.25rem" }}>
            🔥 Run QLoRA Fine-Tune &rarr;
          </Link>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
            Total Samples
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--accent-cyan)" }}>
            {activeDataset?.totalSamples || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Real doc-grounded pairs
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
            Training Split
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--accent-purple)" }}>
            {activeDataset?.trainCount || 0}
            <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: 500, marginLeft: "0.35rem" }}>
              ({Math.round(((activeDataset?.trainCount || 0) / Math.max(activeDataset?.totalSamples || 1, 1)) * 100)}%)
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Instruction fine-tuning set
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
            Val &amp; Test Splits
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#10b981" }}>
            {activeDataset?.valCount || 0} / {activeDataset?.testCount || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Evaluation &amp; generalization holds
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
            Primary Format
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b" }}>
            {activeDataset?.format || "ALPACA"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Multi-export ready
          </div>
        </div>
      </div>

      {/* Dataset Generation & Controls Panel */}
      <div className="glass-panel" style={{ padding: "1.75rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
              ⚡ Synthesize New Training Dataset
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Generates instruction-tuning pairs, DPO preferences, or bi-encoder triplets directly from real documentation chunks.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a
              href={`/api/training/export?datasetId=${activeDataset?.id || ""}&format=ALPACA&split=ALL&type=jsonl`}
              download
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "0.55rem 1rem" }}
            >
              📥 Export Alpaca (.jsonl)
            </a>
            <a
              href={`/api/training/export?datasetId=${activeDataset?.id || ""}&format=CHATML&split=TRAIN&type=jsonl`}
              download
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "0.55rem 1rem" }}
            >
              📥 Export ChatML Train (.jsonl)
            </a>
            <a
              href={`/api/training/export?datasetId=${activeDataset?.id || ""}&format=DPO&split=ALL&type=jsonl`}
              download
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "0.55rem 1rem" }}
            >
              📥 Export DPO (.jsonl)
            </a>
            <a
              href={`/api/training/export?datasetId=${activeDataset?.id || ""}&format=RETRIEVAL_TRIPLET&split=ALL&type=jsonl`}
              download
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "0.55rem 1rem" }}
            >
              📥 Export Triplets (.jsonl)
            </a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
              TARGET FORMAT
            </label>
            <select
              value={genFormat}
              onChange={(e) => setGenFormat(e.target.value as DatasetFormat)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-color)",
                color: "#fff",
                borderRadius: "8px",
                padding: "0.6rem 0.8rem",
                fontSize: "0.875rem",
              }}
            >
              <option value="ALPACA">Alpaca (Instruction, Input, Output)</option>
              <option value="CHATML">ChatML / OpenAI (System, User, Assistant)</option>
              <option value="DPO">DPO (Prompt, Chosen, Rejected)</option>
              <option value="RETRIEVAL_TRIPLET">Retrieval Triplet (Query, Pos, Neg)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
              SAMPLE CAP
            </label>
            <select
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-color)",
                color: "#fff",
                borderRadius: "8px",
                padding: "0.6rem 0.8rem",
                fontSize: "0.875rem",
              }}
            >
              <option value="20">20 Samples (Fast Draft)</option>
              <option value="40">40 Samples (Standard)</option>
              <option value="80">80 Samples (Deep Coverage)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
              TRAIN SPLIT RATIO ({Math.round(trainRatio * 100)}%)
            </label>
            <input
              type="range"
              min="0.6"
              max="0.9"
              step="0.05"
              value={trainRatio}
              onChange={(e) => setTrainRatio(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-purple)", marginTop: "0.4rem" }}
            />
          </div>

          <div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ width: "100%", height: "42px", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
            >
              {isGenerating ? (
                <>
                  <span className="pulse-dot warning" /> Generating...
                </>
              ) : (
                <>⚡ Generate From Chunks</>
              )}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              color: "#6ee7b7",
              fontSize: "0.85rem",
            }}
          >
            {statusMessage}
          </div>
        )}
      </div>

      {/* Main Studio View: Sample Explorer & Format Viewer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: "1.75rem" }}>
        {/* Left Column: Sample Browser */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
              Training Samples ({filteredSamples.length})
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Sourced from official doc chunks
            </span>
          </div>

          {/* Filters Bar */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search instructions or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: "1 1 180px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-color)",
                color: "#fff",
                borderRadius: "6px",
                padding: "0.45rem 0.65rem",
                fontSize: "0.8rem",
              }}
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-color)",
                color: "#fff",
                borderRadius: "6px",
                padding: "0.45rem 0.65rem",
                fontSize: "0.8rem",
              }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={splitFilter}
              onChange={(e) => setSplitFilter(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-color)",
                color: "#fff",
                borderRadius: "6px",
                padding: "0.45rem 0.65rem",
                fontSize: "0.8rem",
              }}
            >
              <option value="ALL">All Splits</option>
              <option value="TRAIN">Train</option>
              <option value="VALIDATION">Validation</option>
              <option value="TEST">Test</option>
            </select>
          </div>

          {/* Sample Item List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "680px", overflowY: "auto" }}>
            {filteredSamples.map((sample, idx) => {
              const isSelected = sample.id === activeSample?.id;
              const splitBadgeClass =
                sample.split === "TRAIN"
                  ? "badge badge-purple"
                  : sample.split === "VALIDATION"
                  ? "badge badge-cyan"
                  : "badge badge-yellow";

              return (
                <div
                  key={sample.id}
                  onClick={() => setSelectedSampleIdx(idx)}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    background: isSelected ? "rgba(168, 85, 247, 0.15)" : "rgba(255,255,255,0.03)",
                    border: isSelected ? "1px solid var(--accent-purple)" : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <span className={splitBadgeClass} style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>
                        {sample.split}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {sample.category}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {sample.sourceDocPath}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", marginBottom: "0.25rem", lineHeight: 1.35 }}>
                    {sample.instruction}
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {sample.outputResponse.slice(0, 90)}...
                  </div>
                </div>
              );
            })}

            {filteredSamples.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                No training samples match the active filters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Format Live Previewer */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          {/* Format Tabs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {(["ALPACA", "CHATML", "DPO", "RETRIEVAL_TRIPLET", "JSONL"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPreviewTab(tab)}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: previewTab === tab ? "var(--accent-purple)" : "rgba(255,255,255,0.06)",
                    color: previewTab === tab ? "#fff" : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab === "ALPACA"
                    ? "🦙 Alpaca"
                    : tab === "CHATML"
                    ? "💬 ChatML"
                    : tab === "DPO"
                    ? "⚖️ DPO Preference"
                    : tab === "RETRIEVAL_TRIPLET"
                    ? "🔍 Triplet"
                    : "📄 JSONL"}
                </button>
              ))}
            </div>

            {activeSample && (
              <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>
                Split: {activeSample.split}
              </span>
            )}
          </div>

          {/* Active Sample Overview */}
          {activeSample ? (
            <div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Selected Sample Provenance
                </div>
                <div style={{ fontSize: "0.875rem", color: "#fff", fontWeight: 600, marginBottom: "0.35rem" }}>
                  {activeSample.instruction}
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <span>Source Doc: <code style={{ color: "var(--accent-cyan)" }}>{activeSample.sourceDocPath}</code></span>
                  <span>Category: <strong>{activeSample.category}</strong></span>
                </div>
              </div>

              {/* Formatted Code Block */}
              <div style={{ position: "relative" }}>
                <pre
                  style={{
                    background: "#090d16",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "1.25rem",
                    color: "#e2e8f0",
                    fontSize: "0.8rem",
                    lineHeight: 1.5,
                    fontFamily: "var(--font-mono, monospace)",
                    maxHeight: "520px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {getSamplePreviewCode(activeSample)}
                </pre>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Tags:</span>
                {activeSample.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "0.7rem",
                      background: "rgba(255,255,255,0.06)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
              Select a sample to preview its formatted training payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
