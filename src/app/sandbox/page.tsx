import Link from "next/link";
import SandboxPlayground from "./SandboxPlayground";

export const metadata = {
  title: "Docker Code Execution Sandbox — EduTech",
  description:
    "Hardened ephemeral Docker container environment for testing and executing generated FastAPI Python code safely with resource and network isolation.",
};

export default function SandboxPage() {
  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
        <Link href="/" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
          Platform Overview
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "var(--text-secondary)" }}>Container Orchestration</span>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>Docker Sandbox</span>
      </div>

      {/* Main Title & Description */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">Ephemeral Container</span>
          <span className="badge badge-info">FastAPI Test Suite</span>
          <span className="badge badge-success">512MB RAM Cap</span>
          <span className="badge badge-warning">Network Isolated</span>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Docker Code Sandbox
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "800px", marginTop: "0.35rem" }}>
          Safely compile, test, and execute AI-generated or custom Python and FastAPI code inside isolated, ephemeral containers with dropped privileges, strict CPU/memory limits, and network egress boundaries.
        </p>
      </div>

      {/* Sandbox Playground Component */}
      <SandboxPlayground />
    </div>
  );
}
