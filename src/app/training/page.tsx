import { Metadata } from "next";
import TrainingDashboard from "./TrainingDashboard";
import { listTrainingDatasets } from "@/lib/training-generator";

export const metadata: Metadata = {
  title: "AI Training Data Studio | EduTech",
  description:
    "Automated LLM fine-tuning dataset generator synthesized directly from real official FastAPI documentation chunks with Alpaca, ChatML, DPO, and retrieval triplets.",
};

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const datasets = await listTrainingDatasets();

  return (
    <div className="container" style={{ paddingTop: "1.5rem", paddingBottom: "4rem" }}>
      <TrainingDashboard initialDatasets={datasets} />
    </div>
  );
}
