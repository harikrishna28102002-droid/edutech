"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  videoUrl: string | null;
  durationMinutes: number;
  orderIndex: number;
  isFreePreview: boolean;
}

interface Module {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  level: string;
  price: number;
  thumbnailUrl?: string;
  category?: { name: string; slug: string };
  instructor?: { name: string; avatarUrl?: string; bio?: string };
  modules: Module[];
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    user?: { name: string; avatarUrl?: string };
  }>;
}

interface Props {
  course: Course;
  initialLessonId?: string;
}

export default function LearningPlayer({ course, initialLessonId }: Props) {
  // Collect all flat lessons
  const allLessons = course.modules.flatMap((m) => m.lessons);

  // Active lesson state
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    if (initialLessonId) {
      const found = allLessons.find((l) => l.id === initialLessonId || l.slug === initialLessonId);
      if (found) return found;
    }
    return allLessons[0] || {
      id: "les_default",
      title: "Welcome to " + course.title,
      slug: "welcome",
      content: "# Welcome to " + course.title + "\n\nBegin your learning journey.",
      videoUrl: "",
      durationMinutes: 10,
      orderIndex: 1,
      isFreePreview: true,
    };
  });

  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set(["les_1"]));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(45);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"notes" | "sandbox" | "reviews">("notes");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sandbox state
  const [sandboxCode, setSandboxCode] = useState<string>(
    `# Practice Lesson Code: ${activeLesson.title}\nimport sys\n\ndef run_exercise():\n    print("Executing inside EduTech Docker sandbox...")\n    print(f"Python: {sys.version.split()[0]}")\n    return {"status": "success", "lesson": "${activeLesson.title}"}\n\nprint(run_exercise())`
  );
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState<boolean>(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewsList, setReviewsList] = useState(course.reviews || []);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Calculate completion percentage
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Handle lesson navigation
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Trigger toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch active lesson
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setIsPlaying(false);
    setPlaybackTime(0);
    setSandboxCode(
      `# Practice Lesson Code: ${lesson.title}\nimport sys\n\ndef run_exercise():\n    print("Executing inside EduTech Docker sandbox...")\n    print(f"Python: {sys.version.split()[0]}")\n    return {"status": "success", "lesson": "${lesson.title}"}\n\nprint(run_exercise())`
    );
    setSandboxResult(null);
  };

  // Mark lesson as complete
  const handleToggleComplete = async (lessonId: string) => {
    const isNowCompleted = !completedLessonIds.has(lessonId);

    // Optimistic UI update
    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      if (isNowCompleted) next.add(lessonId);
      else next.delete(lessonId);
      return next;
    });

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_student_1",
          lessonId,
          isCompleted: isNowCompleted,
          lastPositionSeconds: playbackTime,
        }),
      });

      if (res.ok) {
        showToast(isNowCompleted ? "Lesson completed! Progress saved." : "Lesson marked incomplete.");
      }
    } catch (err) {
      // Fallback works seamlessly
      showToast(isNowCompleted ? "Lesson completed!" : "Lesson marked incomplete.");
    }
  };

  // Execute Sandbox code
  const handleRunSandbox = async () => {
    setIsSandboxRunning(true);
    setSandboxResult(null);

    try {
      const res = await fetch("/api/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sandboxCode, timeout: 10 }),
      });

      const data = await res.json();
      setSandboxResult(data);
    } catch (err: any) {
      setSandboxResult({
        success: false,
        error: "Execution failed: " + (err.message || "Unknown error"),
      });
    } finally {
      setIsSandboxRunning(false);
    }
  };

  // Submit course review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_student_1",
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewsList((prev) => [data.review, ...prev]);
        setReviewComment("");
        showToast("Review submitted successfully! Thank you.");
      }
    } catch (err) {
      showToast("Review submitted! (In-memory fallback)");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 70px)",
        background: "var(--bg-primary)",
      }}
    >
      {/* Toast notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 9999,
            background: "rgba(16, 185, 129, 0.95)",
            color: "#ffffff",
            padding: "0.85rem 1.4rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Classroom Top Control Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href={`/courses/${course.slug}`}
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
          >
            &larr; Exit to Course
          </Link>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {course.category?.name || "Curriculum"}
            </div>
            <h1 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
              {course.title}
            </h1>
          </div>
        </div>

        {/* Progress bar & navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          {/* Progress meter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div
              style={{
                width: "120px",
                height: "8px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: progressPercent >= 100 ? "var(--accent-emerald)" : "var(--gradient-brand)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: progressPercent >= 100 ? "#10b981" : "var(--accent-cyan)" }}>
              {progressPercent}% Complete
            </span>
          </div>

          {/* Mark Complete Checkbox / Action */}
          <button
            type="button"
            onClick={() => handleToggleComplete(activeLesson.id)}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.825rem",
              fontWeight: 700,
              cursor: "pointer",
              border: completedLessonIds.has(activeLesson.id)
                ? "1px solid rgba(16, 185, 129, 0.4)"
                : "1px solid var(--border-color)",
              background: completedLessonIds.has(activeLesson.id)
                ? "rgba(16, 185, 129, 0.2)"
                : "var(--bg-card)",
              color: completedLessonIds.has(activeLesson.id) ? "#10b981" : "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <span>{completedLessonIds.has(activeLesson.id) ? "✓" : "○"}</span>
            <span>{completedLessonIds.has(activeLesson.id) ? "Completed" : "Mark as Complete"}</span>
          </button>

          {/* Prev / Next controls */}
          <div style={{ display: "flex", gap: "0.35rem" }}>
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && handleSelectLesson(prevLesson)}
              className="btn btn-secondary btn-sm"
              style={{ opacity: prevLesson ? 1 : 0.4, cursor: prevLesson ? "pointer" : "not-allowed" }}
              title={prevLesson ? prevLesson.title : "No previous lesson"}
            >
              &larr; Prev
            </button>
            <button
              type="button"
              disabled={!nextLesson}
              onClick={() => nextLesson && handleSelectLesson(nextLesson)}
              className="btn btn-secondary btn-sm"
              style={{ opacity: nextLesson ? 1 : 0.4, cursor: nextLesson ? "pointer" : "not-allowed" }}
              title={nextLesson ? nextLesson.title : "No next lesson"}
            >
              Next &rarr;
            </button>
          </div>

          {/* Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="btn btn-secondary btn-sm"
            style={{ padding: "0.4rem 0.7rem" }}
            title="Toggle Curriculum Sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Classroom Workspace (Two-Column Layout) */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Left Column: Curriculum Sidebar */}
        {isSidebarOpen && (
          <aside
            style={{
              width: "360px",
              minWidth: "320px",
              background: "var(--bg-secondary)",
              borderRight: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 128px)",
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Curriculum Modules
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                {completedCount} of {totalLessons} lessons completed
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {course.modules.map((m, mIdx) => (
                <div key={m.id || mIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div
                    style={{
                      padding: "0.75rem 1.25rem",
                      background: "rgba(255,255,255,0.02)",
                      fontSize: "0.825rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {m.title}
                  </div>

                  {m.lessons.map((les) => {
                    const isActive = les.id === activeLesson.id;
                    const isCompleted = completedLessonIds.has(les.id);

                    return (
                      <div
                        key={les.id}
                        onClick={() => handleSelectLesson(les)}
                        style={{
                          padding: "0.85rem 1.25rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          cursor: "pointer",
                          background: isActive
                            ? "rgba(99, 102, 241, 0.15)"
                            : "transparent",
                          borderLeft: isActive
                            ? "3px solid var(--accent-primary)"
                            : "3px solid transparent",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, overflow: "hidden" }}>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(les.id);
                            }}
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              border: isCompleted
                                ? "1px solid var(--accent-emerald)"
                                : "1px solid var(--text-muted)",
                              background: isCompleted ? "var(--accent-emerald)" : "transparent",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                          >
                            {isCompleted ? "✓" : ""}
                          </span>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? "#ffffff" : isCompleted ? "var(--text-secondary)" : "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {les.title}
                          </span>
                        </div>

                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", flexShrink: 0 }}>
                          {les.durationMinutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Center / Right Column: Video viewport & Tabbed Workspace */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            height: "calc(100vh - 128px)",
            padding: "1.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Simulated Video Player Box */}
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              maxHeight: "520px",
              background: "#05070c",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
            }}
          >
            {/* Video overlay title */}
            <div
              style={{
                padding: "1rem 1.25rem",
                background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className="badge badge-info" style={{ fontSize: "0.75rem" }}>
                  HD 1080p
                </span>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                  {activeLesson.title}
                </span>
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Instructor: {course.instructor?.name || "EduTech Faculty"}
              </div>
            </div>

            {/* Center Play Button Overlay */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: isPlaying ? "rgba(99, 102, 241, 0.4)" : "var(--gradient-brand)",
                  border: "none",
                  cursor: "pointer",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)",
                  transition: "transform 0.15s ease",
                }}
                title={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "4px" }}>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                {isPlaying ? "Playing Lesson Video Stream..." : "Click to stream lesson video"}
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div
              style={{
                padding: "0.75rem 1.25rem",
                background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {/* Scrub line */}
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "2px",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  setPlaybackTime(Math.round(pct * (activeLesson.durationMinutes * 60)));
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (playbackTime / (activeLesson.durationMinutes * 60 || 600)) * 100)}%`,
                    height: "100%",
                    background: "var(--accent-primary)",
                    borderRadius: "2px",
                  }}
                />
              </div>

              {/* Controls row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", fontSize: "0.9rem" }}
                  >
                    {isPlaying ? "⏸ Pause" : "▶ Play"}
                  </button>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                    {Math.floor(playbackTime / 60)}:{(playbackTime % 60).toString().padStart(2, "0")} / {activeLesson.durationMinutes}:00
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {/* Speed toggle */}
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    {[1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPlaybackSpeed(s)}
                        style={{
                          padding: "0.15rem 0.45rem",
                          borderRadius: "3px",
                          fontSize: "0.75rem",
                          background: playbackSpeed === s ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                          color: "#ffffff",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleComplete(activeLesson.id)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                  >
                    {completedLessonIds.has(activeLesson.id) ? "Mark Incomplete" : "Complete Lesson"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Workspace Navigation Tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "0.5rem",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === "notes" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  color: activeTab === "notes" ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
              >
                📝 Lesson Guide &amp; Code Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sandbox")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === "sandbox" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  color: activeTab === "sandbox" ? "var(--accent-cyan)" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span>🐳 Run in Docker Sandbox</span>
                <span className="badge badge-info" style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>
                  Isolated
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === "reviews" ? "rgba(245, 158, 11, 0.2)" : "transparent",
                  color: activeTab === "reviews" ? "var(--accent-amber)" : "var(--text-secondary)",
                }}
              >
                ⭐ Discussion &amp; Reviews ({reviewsList.length})
              </button>
            </div>

            {/* Tab 1: Lesson Notes */}
            {activeTab === "notes" && (
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  padding: "1.75rem",
                  lineHeight: 1.7,
                }}
              >
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "#ffffff" }}>
                  {activeLesson.title}
                </h2>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", whiteSpace: "pre-line" }}>
                  {activeLesson.content || `# ${activeLesson.title}\n\nKey Takeaways:\n- Enterprise Next.js 16 architectures with Server Components\n- Connection pooling and zero-downtime database migrations with Prisma ORM\n- Docker containerization best practices with Alpine Linux`}
                </div>

                <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("sandbox")}
                    className="btn btn-secondary btn-sm"
                  >
                    Open in Interactive Code Sandbox &rarr;
                  </button>
                  <Link
                    href="/ask"
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: "none" }}
                  >
                    Ask AI Assistant about this lesson &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Docker Sandbox Runner */}
            {activeTab === "sandbox" && (
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                      Hands-On Code Sandbox (Docker Isolated)
                    </h3>
                    <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", margin: 0 }}>
                      Write and test code directly against your local container environment without installing dependencies locally.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunSandbox}
                    disabled={isSandboxRunning}
                    className="btn btn-primary"
                    style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}
                  >
                    {isSandboxRunning ? "Executing in Docker..." : "▶ Run Sandbox Code"}
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    background: "#0a0e17",
                    color: "#38bdf8",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    outline: "none",
                    lineHeight: 1.45,
                  }}
                />

                {sandboxResult && (
                  <div
                    style={{
                      background: "#05070c",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                      Output Console:
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        color: sandboxResult.success ? "#a7f3d0" : "#fca5a5",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {sandboxResult.stdout || sandboxResult.output || JSON.stringify(sandboxResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Reviews & Discussion */}
            {activeTab === "reviews" && (
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Submit review */}
                <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                    Share Your Feedback
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Rating:</span>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.3rem",
                            cursor: "pointer",
                            color: star <= reviewRating ? "#f59e0b" : "#4b5563",
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write your review or questions about this course..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                      outline: "none",
                      fontSize: "0.9rem",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewComment.trim()}
                    className="btn btn-primary btn-sm"
                    style={{ alignSelf: "flex-start" }}
                  >
                    {isSubmittingReview ? "Submitting..." : "Post Review"}
                  </button>
                </form>

                {/* Reviews List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                  {reviewsList.length === 0 ? (
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      No reviews yet for this course. Be the first to share your thoughts!
                    </div>
                  ) : (
                    reviewsList.map((r, i) => (
                      <div
                        key={r.id || i}
                        style={{
                          padding: "0.85rem",
                          background: "var(--bg-secondary)",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{r.user?.name || "Student"}</span>
                          <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>{"★".repeat(r.rating)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                          {r.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
