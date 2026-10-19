import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface CourseCardData {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  level: string;
  price: number;
  thumbnailUrl: string | null;
  category: { name: string; slug: string } | null;
  instructor: { name: string; avatarUrl: string | null };
  modulesCount: number;
  lessonsCount: number;
  averageRating: number;
}

async function getCourses(): Promise<CourseCardData[]> {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        instructor: { select: { name: true, avatarUrl: true } },
        modules: {
          include: {
            lessons: { select: { id: true } },
          },
        },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return courses.map((c) => {
      const lessonsCount = c.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const avgRating =
        c.reviews.length > 0
          ? c.reviews.reduce((acc, r) => acc + r.rating, 0) / c.reviews.length
          : 5.0;

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        subtitle: c.subtitle,
        description: c.description,
        level: c.level,
        price: Number(c.price),
        thumbnailUrl: c.thumbnailUrl,
        category: c.category ? { name: c.category.name, slug: c.category.slug } : null,
        instructor: c.instructor,
        modulesCount: c.modules.length,
        lessonsCount,
        averageRating: Number(avgRating.toFixed(1)),
      };
    });
  } catch (e) {
    console.error("Database query failed:", e);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Link href="/" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.85rem" }}>
            &larr; Back to Platform Overview
          </Link>
        </div>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Course Catalog
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginTop: "0.25rem" }}>
          Browse curriculum modules, video lessons, and interactive learning paths stored in PostgreSQL.
        </p>
      </div>

      {/* Filter and stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
          padding: "1rem 1.25rem",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-info" style={{ cursor: "pointer" }}>All Categories</span>
          <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", cursor: "pointer" }}>
            Web Development
          </span>
          <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", cursor: "pointer" }}>
            AI &amp; Machine Learning
          </span>
          <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", cursor: "pointer" }}>
            Cloud &amp; DevOps
          </span>
        </div>

        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Showing <strong>{courses.length > 0 ? courses.length : 3}</strong> courses
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid-3">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course.id}
              className="glass-panel"
              style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  height: "170px",
                  backgroundImage: `url('${course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                  <span
                    className={`badge ${
                      course.level === "ADVANCED"
                        ? "badge-purple"
                        : course.level === "INTERMEDIATE"
                        ? "badge-info"
                        : "badge-success"
                    }`}
                  >
                    {course.level}
                  </span>
                </div>
              </div>

              <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                {course.category && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent-cyan)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {course.category.name}
                  </span>
                )}
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    margin: "0.4rem 0 0.5rem 0",
                    color: "#fff",
                  }}
                >
                  {course.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginBottom: "1.25rem",
                    flex: 1,
                    lineHeight: "1.5",
                  }}
                >
                  {course.subtitle || course.description.slice(0, 110) + "..."}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1rem",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {course.instructor.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.instructor.avatarUrl}
                      alt={course.instructor.name}
                      style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                    />
                  )}
                  <span>{course.instructor.name}</span>
                  <span style={{ marginLeft: "auto", color: "var(--accent-amber)" }}>
                    ★ {course.averageRating}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "1rem",
                  }}
                >
                  <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                    ${course.price.toFixed(2)}
                  </span>
                  <button className="btn btn-primary btn-sm">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Fallback static preview cards if database not yet migrated
          [
            {
              id: "1",
              title: "Production Next.js 16 & Microservices Architecture",
              category: "Web Development",
              level: "ADVANCED",
              price: 89.99,
              rating: 5.0,
              instructor: "Prof. Marcus Sterling",
              image:
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
            },
            {
              id: "2",
              title: "Applied LLM Engineering & Agentic Systems",
              category: "AI & Machine Learning",
              level: "INTERMEDIATE",
              price: 99.99,
              rating: 5.0,
              instructor: "Prof. Marcus Sterling",
              image:
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            },
            {
              id: "3",
              title: "Docker & Container Mastery for Developers",
              category: "Cloud & DevOps",
              level: "BEGINNER",
              price: 49.99,
              rating: 5.0,
              instructor: "Dr. Evelyn Vance",
              image:
                "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80",
            },
          ].map((c) => (
            <div
              key={c.id}
              className="glass-panel"
              style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  height: "170px",
                  backgroundImage: `url('${c.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                  <span className="badge badge-purple">{c.level}</span>
                </div>
              </div>
              <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontWeight: 600 }}>
                  {c.category}
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.4rem 0 0.5rem 0", color: "#fff" }}>
                  {c.title}
                </h3>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.5rem 0 1rem 0" }}>
                  Instructor: {c.instructor} • <span style={{ color: "var(--accent-amber)" }}>★ {c.rating}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "1rem",
                    marginTop: "auto",
                  }}
                >
                  <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                    ${c.price.toFixed(2)}
                  </span>
                  <button className="btn btn-primary btn-sm">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
