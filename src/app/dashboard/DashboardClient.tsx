"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  slug: string;
  level: string;
  price: number;
  thumbnailUrl?: string;
  category?: { name: string; slug: string };
  instructor?: { name: string; avatarUrl?: string };
  modulesCount: number;
  lessonsCount: number;
}

interface Enrollment {
  id: string;
  courseId: string;
  status: string;
  progressPercent: number;
  createdAt: string;
  course?: Course;
}

interface Props {
  initialEnrollments: Enrollment[];
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export default function DashboardClient({ initialEnrollments, user }: Props) {
  const [enrollments] = useState<Enrollment[]>(initialEnrollments);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  const activeCourses = enrollments.filter((e) => e.progressPercent < 100);
  const completedCourses = enrollments.filter((e) => e.progressPercent >= 100);

  const displayedEnrollments =
    activeTab === "active"
      ? activeCourses
      : activeTab === "completed"
      ? completedCourses
      : enrollments;

  // Primary active course to resume
  const resumeEnrollment = activeCourses[0] || enrollments[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Student Welcome & Profile Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          padding: "2rem",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--accent-primary)",
              }}
            />
          ) : (
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "var(--gradient-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              {user.name[0]}
            </div>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>
                Welcome back, {user.name}
              </h1>
              <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>
                {user.role}
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", margin: "0.3rem 0 0 0", fontSize: "0.95rem" }}>
              {user.bio || "Continuous learner exploring modern cloud architectures and AI."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/courses" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Browse Catalog
          </Link>
          <Link href="/studio" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            Creator Studio
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Enrolled Courses
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "0.25rem" }}>
            {enrollments.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {activeCourses.length} in progress
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Study Streak
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.25rem" }}>
            7 Days 🔥
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Top 5% of active students
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Lessons Completed
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "0.25rem" }}>
            14
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Across 2 curriculum paths
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Learning Hours
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a855f7", marginTop: "0.25rem" }}>
            18.5 hrs
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Docker sandbox &amp; video time
          </div>
        </div>
      </div>

      {/* Featured "Continue Learning / Resume" Card */}
      {resumeEnrollment && resumeEnrollment.course && (
        <section
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "2rem",
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <span className="badge badge-primary">Continue Learning</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Last watched 2 hours ago
              </span>
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.5rem" }}>
              {resumeEnrollment.course.title}
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              Ready to jump back in? Continue with your hands-on code exercises and video walkthroughs.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", maxWidth: "450px" }}>
              <div
                style={{
                  flex: 1,
                  height: "8px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${resumeEnrollment.progressPercent}%`,
                    height: "100%",
                    background: "var(--gradient-brand)",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-cyan)", whiteSpace: "nowrap" }}>
                {resumeEnrollment.progressPercent}% Completed
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
            <Link
              href={`/learn/${resumeEnrollment.course.slug}`}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.9rem", fontSize: "1rem", justifyContent: "center", textDecoration: "none" }}
            >
              ▶ Resume Lesson
            </Link>

            <Link
              href={`/courses/${resumeEnrollment.course.slug}`}
              className="btn btn-secondary"
              style={{ width: "100%", padding: "0.6rem", fontSize: "0.85rem", justifyContent: "center", textDecoration: "none" }}
            >
              View Full Syllabus
            </Link>
          </div>
        </section>
      )}

      {/* Enrolled Courses Section */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>My Courses ({enrollments.length})</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.2rem 0 0 0" }}>
              Manage your active curricula, review completed certifications, and track progress.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.35rem" }}>
            {(["all", "active", "completed"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  border: activeTab === t ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                  background: activeTab === t ? "rgba(99, 102, 241, 0.2)" : "var(--bg-card)",
                  color: activeTab === t ? "var(--accent-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {displayedEnrollments.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "1rem" }}>
              No courses found in this tab.
            </p>
            <Link href="/courses" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Browse Available Courses
            </Link>
          </div>
        ) : (
          <div className="grid-3">
            {displayedEnrollments.map((enr) => {
              const c = enr.course;
              if (!c) return null;

              return (
                <div
                  key={enr.id}
                  className="glass-panel"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "150px",
                      backgroundImage: `url('${c.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                    }}
                  >
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <span className="badge badge-info" style={{ fontSize: "0.75rem" }}>
                        {c.level}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "#ffffff" }}>
                      {c.title}
                    </h3>

                    {/* Progress bar */}
                    <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.4rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Progress</span>
                        <span style={{ fontWeight: 700, color: enr.progressPercent >= 100 ? "#10b981" : "var(--accent-cyan)" }}>
                          {enr.progressPercent}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "3px",
                          overflow: "hidden",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: `${enr.progressPercent}%`,
                            height: "100%",
                            background: enr.progressPercent >= 100 ? "var(--accent-emerald)" : "var(--gradient-brand)",
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link
                          href={`/learn/${c.slug}`}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                        >
                          {enr.progressPercent >= 100 ? "Review Course" : "Continue"}
                        </Link>
                        <Link
                          href={`/courses/${c.slug}`}
                          className="btn btn-secondary btn-sm"
                          style={{ textDecoration: "none" }}
                          title="View Course Details"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
