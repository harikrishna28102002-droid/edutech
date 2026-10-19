import Link from "next/link";
import prisma from "@/lib/prisma";
import DocViewer from "./DocViewer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FastAPI Documentation Knowledge Base — EduTech",
  description:
    "Real-time ingested and synchronized FastAPI official documentation from GitHub (tiangolo/fastapi).",
};

async function getInitialDocsData() {
  try {
    const source = await prisma.docSource.findUnique({
      where: { name: "FastAPI Official Documentation" },
      include: {
        _count: { select: { pages: true } },
      },
    });

    if (!source) {
      return { docs: [], source: null };
    }

    const docs = await prisma.docPage.findMany({
      where: { sourceId: source.id },
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }],
    });

    return {
      docs: docs.map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        category: d.category,
        path: d.path,
        githubUrl: d.githubUrl,
        excerpt: d.excerpt,
        content: d.content,
        orderIndex: d.orderIndex,
      })),
      source: {
        repo: source.repo,
        branch: source.branch,
        lastCommitSha: source.lastCommitSha,
        lastSyncAt: source.lastSyncAt ? source.lastSyncAt.toISOString() : null,
        pagesCount: source._count.pages,
        syncStatus: source.syncStatus,
      },
    };
  } catch (error) {
    console.error("Database error loading initial FastAPI docs:", error);
    return { docs: [], source: null };
  }
}

export default async function FastApiDocsPage() {
  const { docs, source } = await getInitialDocsData();

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
        <Link href="/" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
          Platform Overview
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "var(--text-secondary)" }}>Knowledge Base</span>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>FastAPI Ingestion Hub</span>
      </div>

      {/* Main Title & Subtitle */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">Real GitHub Ingestion</span>
          <span className="badge badge-success">Auto-Synced</span>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          FastAPI Official Documentation
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "780px", marginTop: "0.35rem" }}>
          Continuously ingested and mirrored straight from the official{" "}
          <a
            href="https://github.com/tiangolo/fastapi"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
          >
            tiangolo/fastapi
          </a>{" "}
          GitHub repository. Available both as a searchable knowledge library and as an interactive LMS course track.
        </p>
      </div>

      {/* Interactive Doc Viewer */}
      <DocViewer initialDocs={docs} initialSource={source} />
    </div>
  );
}
