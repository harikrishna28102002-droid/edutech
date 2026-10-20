"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  level: string;
  isPublished: boolean;
  enrollmentsCount: number;
  averageRating: number;
  modulesCount: number;
  lessonsCount: number;
}

interface Props {
  initialCourses: CourseItem[];
  categories: Category[];
}

export default function StudioClient({ initialCourses, categories }: Props) {
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State for new course
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    categoryId: categories[0]?.id || "cat_web",
    level: "INTERMEDIATE",
    price: "49.99",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    moduleTitle: "Module 1: Architecture & Foundations",
    lessonTitle: "Core Principles & Container Setup",
    lessonDuration: 20,
    lessonContent: "# Lesson Overview\n\nUnderstand zero-downtime microservices and cloud deployment.",
    isFreePreview: true,
  });

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showStatus("error", "Course title and description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Course
      const courseRes = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          categoryId: formData.categoryId,
          level: formData.level,
          price: parseFloat(formData.price) || 0,
          thumbnailUrl: formData.thumbnailUrl,
          instructorId: "usr_instructor_1",
        }),
      });

      const courseData = await courseRes.json();
      if (!courseRes.ok) throw new Error(courseData.error || "Failed to create course");
      const newCourse = courseData.course;

      // 2. Add initial module if specified
      if (formData.moduleTitle && newCourse.id) {
        const modRes = await fetch(`/api/courses/${newCourse.id}/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: formData.moduleTitle, orderIndex: 1 }),
        });
        const modData = await modRes.json();

        // 3. Add initial lesson if specified
        if (formData.lessonTitle && modData.module?.id) {
          await fetch(`/api/modules/${modData.module.id}/lessons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.lessonTitle,
              content: formData.lessonContent,
              durationMinutes: formData.lessonDuration,
              isFreePreview: formData.isFreePreview,
            }),
          });
        }
      }

      setCourses((prev) => [
        {
          id: newCourse.id,
          title: newCourse.title,
          slug: newCourse.slug,
          price: newCourse.price,
          level: newCourse.level,
          isPublished: true,
          enrollmentsCount: 0,
          averageRating: 5.0,
          modulesCount: 1,
          lessonsCount: 1,
        },
        ...prev,
      ]);

      showStatus("success", `Course '${newCourse.title}' created and published successfully!`);
      setIsCreating(false);
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        categoryId: categories[0]?.id || "cat_web",
        level: "INTERMEDIATE",
        price: "49.99",
        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
        moduleTitle: "Module 1: Architecture & Foundations",
        lessonTitle: "Core Principles & Container Setup",
        lessonDuration: 20,
        lessonContent: "# Lesson Overview\n\nUnderstand zero-downtime microservices and cloud deployment.",
        isFreePreview: true,
      });
    } catch (err: any) {
      showStatus("error", err.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}"?`)) return;

    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        showStatus("success", `Course "${title}" removed.`);
      }
    } catch (err) {
      showStatus("error", "Failed to delete course.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Toast Alert */}
      {statusMessage && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background: statusMessage.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
            border: statusMessage.type === "success" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
            color: statusMessage.type === "success" ? "#10b981" : "#ef4444",
            fontWeight: 600,
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Studio Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span className="badge badge-purple">Instructor &amp; Faculty Studio</span>
            <span className="badge badge-success">Prisma Auto-Sync</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            Course Creator &amp; Curriculum Studio
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.3rem", fontSize: "0.95rem" }}>
            Design courses, sequence curriculum modules, and author markdown lessons stored in PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating((v) => !v)}
          className="btn btn-primary"
        >
          {isCreating ? "✕ Close Builder" : "+ Create New Course"}
        </button>
      </div>

      {/* Visual Course Builder Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateCourse}
          className="glass-panel"
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            border: "1px solid var(--accent-primary)",
          }}
        >
          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
              Step 1: Course Catalog Metadata
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Define basic catalog details, category classification, and pricing.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Caching with Redis & Next.js"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Course Subtitle
              </label>
              <input
                type="text"
                placeholder="e.g. High-performance cache invalidation and distributed queues"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Comprehensive description of topics covered, architecture patterns, and prerequisites..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                color: "#ffffff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  color: "#ffffff",
                  outline: "none",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Difficulty Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  color: "#ffffff",
                  outline: "none",
                }}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Module & Initial Lesson setup */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 0.3rem 0" }}>
              Step 2: Seed Initial Curriculum Module &amp; Lesson
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Quickly create your first module and introductory lesson. You can add more lessons anytime.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Module Title
                </label>
                <input
                  type="text"
                  value={formData.moduleTitle}
                  onChange={(e) => setFormData({ ...formData, moduleTitle: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    color: "#ffffff",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  First Lesson Title
                </label>
                <input
                  type="text"
                  value={formData.lessonTitle}
                  onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    color: "#ffffff",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Lesson Content (Markdown)
              </label>
              <textarea
                rows={4}
                value={formData.lessonContent}
                onChange={(e) => setFormData({ ...formData, lessonContent: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "#0a0e17",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  color: "#38bdf8",
                  fontFamily: "monospace",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? "Publishing to PostgreSQL..." : "🚀 Publish Course to Catalog"}
            </button>
          </div>
        </form>
      )}

      {/* Author Catalog Table */}
      <section className="glass-panel" style={{ padding: "1.5rem", overflowX: "auto" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>
          Authored Courses Catalog ({courses.length})
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-secondary)" }}>
              <th style={{ padding: "0.75rem 0.5rem" }}>Course</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Curriculum</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Price</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Students</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Rating</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.85rem 0.5rem" }}>
                  <div style={{ fontWeight: 700, color: "#ffffff" }}>{course.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{course.slug}</div>
                </td>
                <td style={{ padding: "0.85rem 0.5rem", color: "var(--text-secondary)" }}>
                  {course.modulesCount} modules / {course.lessonsCount} lessons
                </td>
                <td style={{ padding: "0.85rem 0.5rem", fontWeight: 700 }}>
                  {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
                </td>
                <td style={{ padding: "0.85rem 0.5rem", color: "var(--accent-cyan)", fontWeight: 700 }}>
                  {course.enrollmentsCount}
                </td>
                <td style={{ padding: "0.85rem 0.5rem", color: "#f59e0b" }}>
                  ★ {course.averageRating}
                </td>
                <td style={{ padding: "0.85rem 0.5rem" }}>
                  <span className="badge badge-success" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                    Published
                  </span>
                </td>
                <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                    <Link
                      href={`/learn/${course.slug}`}
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: "none", fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                    >
                      Classroom
                    </Link>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: "none", fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", color: "#ef4444" }}
                      title="Delete Course"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
