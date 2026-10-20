import type { Metadata } from "next";
import Link from "next/link";
import { getAllCourses } from "@/lib/lms-service";
import CoursesExplorer from "./CoursesExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course Catalog & Curricula | EduTech Platform",
  description:
    "Explore enterprise curricula, video lessons, and interactive learning paths in Next.js, AI, and Cloud Architecture.",
};

async function getCourses() {
  try {
    const list = await getAllCourses();
    return list.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      subtitle: c.subtitle || null,
      description: c.description,
      level: c.level,
      price: c.price,
      thumbnailUrl: c.thumbnailUrl || null,
      category: c.category ? { name: c.category.name, slug: c.category.slug } : null,
      instructor: c.instructor,
      modulesCount: c.modulesCount,
      lessonsCount: c.lessonsCount,
      averageRating: c.averageRating,
    }));
  } catch (e) {
    console.error("Failed to load courses:", e);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Link href="/" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.85rem" }}>
            &larr; Back to Platform Overview
          </Link>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Course <span className="gradient-text">Catalog</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginTop: "0.25rem", maxWidth: "720px" }}>
          Browse enterprise curriculum modules, video lessons, and hands-on coding sandboxes powered by PostgreSQL and Docker.
        </p>
      </div>

      <CoursesExplorer initialCourses={courses} />
    </main>
  );
}
