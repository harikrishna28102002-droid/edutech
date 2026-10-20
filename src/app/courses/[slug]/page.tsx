import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseByIdOrSlug } from "@/lib/lms-service";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseByIdOrSlug(slug);

  if (!course) {
    return { title: "Course Not Found | EduTech" };
  }

  return {
    title: `${course.title} | EduTech Academy`,
    description: course.subtitle || course.description.slice(0, 160),
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseByIdOrSlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <Link href="/courses" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
            &larr; All Courses
          </Link>
          <span>/</span>
          {course.category && <span>{course.category.name}</span>}
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{course.title}</span>
        </div>
      </nav>

      {/* Hero Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "2.5rem",
          alignItems: "start",
          marginBottom: "3rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            {course.category && (
              <span className="badge badge-primary">{course.category.name}</span>
            )}
            <span className="badge" style={{ background: "rgba(255, 255, 255, 0.08)", color: "#ffffff" }}>
              {course.level}
            </span>
            <span className="badge badge-success">
              ★ {course.averageRating} ({course.reviewsCount} reviews)
            </span>
          </div>

          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}
          >
            {course.title}
          </h1>

          {course.subtitle && (
            <p
              style={{
                fontSize: "1.2rem",
                color: "var(--text-secondary)",
                marginBottom: "1.5rem",
                lineHeight: 1.5,
              }}
            >
              {course.subtitle}
            </p>
          )}

          {/* Instructor snippet */}
          {course.instructor && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.5rem" }}>
              {course.instructor.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.instructor.avatarUrl}
                  alt={course.instructor.name}
                  style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {course.instructor.name[0]}
                </div>
              )}
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>Instructor: {course.instructor.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{course.instructor.bio}</div>
              </div>
            </div>
          )}

          {/* Metadata badges */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <div>
              📚 <strong>{course.modulesCount}</strong> Modules
            </div>
            <div>
              🎬 <strong>{course.lessonsCount}</strong> Lessons
            </div>
            <div>
              ⏱️ <strong>{course.totalDurationMinutes}</strong> Total Minutes
            </div>
            <div>
              👥 <strong>{course.enrollmentsCount}</strong> Students Enrolled
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <aside
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            position: "sticky",
            top: "2rem",
          }}
        >
          {course.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              style={{ width: "100%", height: "180px", objectFit: "cover" }}
            />
          )}
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
              </span>
              {course.price > 0 && (
                <span style={{ textDecoration: "line-through", color: "var(--text-secondary)", fontSize: "1rem" }}>
                  ${(course.price * 1.5).toFixed(2)}
                </span>
              )}
            </div>

            <Link
              href={`/learn/${course.slug}`}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", justifyContent: "center", textDecoration: "none" }}
            >
              ▶ Enter Classroom &amp; Learn
            </Link>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", padding: "0.65rem", fontSize: "0.9rem", justifyContent: "center" }}
              onClick={() => {
                fetch("/api/enroll", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ courseId: course.id, userId: "usr_student_1" }),
                }).then(() => alert("Successfully enrolled in " + course.title + "! Added to your Dashboard."));
              }}
            >
              ✓ Enroll in Course
            </button>

            <Link
              href="/api-docs"
              className="btn btn-outline"
              style={{ width: "100%", padding: "0.6rem", fontSize: "0.85rem", justifyContent: "center", textDecoration: "none" }}
            >
              Test via REST API Explorer &rarr;
            </Link>

            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5, borderTop: "1px solid var(--border-color)", paddingTop: "0.8rem" }}>
              ✓ Full lifetime access<br />
              ✓ Access on mobile and TV<br />
              ✓ Certificate of completion<br />
              ✓ PostgreSQL &amp; Prisma verified
            </div>
          </div>
        </aside>
      </div>

      {/* Description & Curriculum */}
      <section style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {/* About */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.85rem" }}>About This Course</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "1rem" }}>
            {course.description}
          </p>
        </div>

        {/* Course Curriculum */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
            Course Curriculum ({course.modulesCount} Modules, {course.lessonsCount} Lessons)
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {course.modules?.map((m: any, idx: number) => (
              <div
                key={m.id || idx}
                style={{
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.85rem 1.25rem",
                    background: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid var(--border-color)",
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{m.title}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 400 }}>
                    {m.lessons?.length || 0} lessons
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {m.lessons?.map((les: any) => (
                    <Link
                      key={les.id}
                      href={`/learn/${course.slug}?lesson=${les.id}`}
                      style={{
                        padding: "0.75rem 1.25rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "0.9rem",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ color: "var(--accent-primary)" }}>▶</span>
                        <span style={{ color: "var(--text-primary)" }}>{les.title}</span>
                        {les.isFreePreview && (
                          <span className="badge badge-success" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
                            Preview
                          </span>
                        )}
                      </div>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                        {les.durationMinutes} min
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
            Student Reviews ({course.reviewsCount})
          </h2>

          {course.reviews?.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No reviews yet. Be the first student to review!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {course.reviews?.map((r: any) => (
                <div
                  key={r.id}
                  style={{
                    padding: "1rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{r.user?.name || "Student"}</div>
                    <div style={{ color: "#f59e0b", fontSize: "0.85rem" }}>{"★".repeat(r.rating)}</div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
