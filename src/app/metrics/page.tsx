import type { Metadata } from "next";
import { collectPlatformMetrics } from "@/lib/metrics-service";
import MetricsDashboard from "./MetricsDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Metrics, Sync & Evaluation Telemetry | EduTech Platform",
  description:
    "Real-time operational dashboard monitoring model evaluation benchmark scores, automated daily GitHub sync status, and system telemetry.",
};

export default async function MetricsPage() {
  const metrics = await collectPlatformMetrics();

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <MetricsDashboard initialMetrics={metrics} />
    </main>
  );
}
