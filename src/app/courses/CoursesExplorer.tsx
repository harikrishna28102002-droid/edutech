"use client";

import React, { useState } from "react";
import Link from "next/link";

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

interface Props {
  initialCourses: CourseCardData[];
}

export default function CoursesExplorer({ initialCourses }: Props) {
  const [courses] = useState<CourseCardData[]>(initialCourses);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [sortBy, setSortBy] = useState<"rating" | "lessons" | "price">("rating");
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});

  // Categories list derived from courses
  const categories = [
    { label: "All Categories", value: "all" },
    { label: "Web Development", value: "web-development" },
    { label: "AI & Machine Learning", value: "ai-machine-learning" },
    { label: "Cloud & DevOps", value: "cloud-devops" },
  ];

  // Filtering logic
  const filtered = courses
    .filter((c) => {
      const matchesCat =
        selectedCategory === "all" ||
        (c.category && c.category.slug === selectedCategory);
      const matchesLevel =
        selectedLevel === "all" || c.level.toUpperCase() === selectedLevel.toUpperCase();
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.instructor?.name && c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" ? c.price === 0 : c.price > 0);

      return matchesCat && matchesLevel && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.averageRating - a.averageRating;
      if (sortBy === "lessons") return b.lessonsCount - a.lessonsCount;
      if (sortBy === "price") return a.price - b.price;
      return 0;
    });

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    try {
      await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, userId: "usr_student_1" }),
      });
      setEnrolledMap((prev) => ({ ...prev, [courseId]: true }));
      alert(`Enrolled in ${courseTitle}! Jump into your Classroom.`);
    } catch (e) {
      alert(`Enrolled in ${courseTitle}!`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Category Pills & Search Row */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          padding: "1.25rem 1.5rem",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Category Pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                fontWeight: 600,
                border: selectedCategory === cat.value ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                background: selectedCategory === cat.value ? "rgba(99, 102, 241, 0.2)" : "var(--bg-secondary)",
                color: selectedCategory === cat.value ? "var(--accent-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search box */}
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search courses, instructors, technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 1rem 0.65rem 2.4rem",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            style={{
              padding: "0.65rem 0.9rem",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
            }}
          >
            <option value="all">All Difficulty Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          {/* Price Filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as any)}
            style={{
              padding: "0.65rem 0.9rem",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
            }}
          >
            <option value="all">All Pricing</option>
            <option value="free">Free Courses</option>
            <option value="paid">Paid Courses</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "0.65rem 0.9rem",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
            }}
          >
            <option value="rating">Highest Rated</option>
            <option value="lessons">Most Lessons</option>
            <option value="price">Lowest Price</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <span>Showing <strong>{filtered.length}</strong> of {courses.length} courses</span>
          <Link href="/studio" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.85rem" }}>
            Want to teach? Author a Course in Studio &rarr;
          </Link>
        </div>
      </div>

      {/* Course Cards Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "3.5rem",
            textAlign: "center",
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            No courses match your filter criteria
          </div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Try resetting your search query or choosing another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedLevel("all");
              setPriceFilter("all");
              setSearchQuery("");
            }}
            className="btn btn-primary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((course) => {
            const isEnrolled = !!enrolledMap[course.id];

            return (
              <div
                key={course.id}
                className="glass-panel"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Thumbnail image with badges */}
                <div
                  style={{
                    height: "180px",
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
                      style={{ fontSize: "0.75rem" }}
                    >
                      {course.level}
                    </span>
                  </div>

                  {course.category && (
                    <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
                      <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>
                        {course.category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      margin: "0 0 0.4rem 0",
                      color: "#ffffff",
                      lineHeight: 1.35,
                    }}
                  >
                    <Link
                      href={`/courses/${course.slug}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {course.title}
                    </Link>
                  </h3>

                  {course.subtitle && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        marginBottom: "1rem",
                        lineHeight: 1.45,
                      }}
                    >
                      {course.subtitle}
                    </p>
                  )}

                  {/* Instructor row */}
                  {course.instructor && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                      {course.instructor.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.instructor.avatarUrl}
                          alt={course.instructor.name}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "var(--accent-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}
                        >
                          {course.instructor.name[0]}
                        </div>
                      )}
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {course.instructor.name}
                      </span>
                    </div>
                  )}

                  {/* Metadata Stats */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      borderTop: "1px solid var(--border-color)",
                      paddingTop: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <span>📚 {course.modulesCount} modules • {course.lessonsCount} lessons</span>
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                      ★ {course.averageRating}
                    </span>
                  </div>

                  {/* Price and CTA Buttons */}
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff" }}>
                      {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
                    </div>

                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <Link
                        href={`/learn/${course.slug}`}
                        className="btn btn-primary btn-sm"
                        style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                      >
                        ▶ Classroom
                      </Link>

                      <Link
                        href={`/courses/${course.slug}`}
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.35rem 0.65rem" }}
                      >
                        Syllabus
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
