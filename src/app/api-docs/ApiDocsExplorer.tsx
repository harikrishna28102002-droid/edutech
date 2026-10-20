"use client";

import React, { useState } from "react";

interface EndpointSpec {
  id: string;
  tag: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  summary: string;
  description: string;
  pathParams?: Array<{ name: string; description: string; defaultVal: string }>;
  queryParams?: Array<{ name: string; description: string; defaultVal: string }>;
  defaultBody?: string;
}

const ENDPOINTS: EndpointSpec[] = [
  // Courses
  {
    id: "get_courses",
    tag: "Courses",
    method: "GET",
    path: "/api/courses",
    summary: "List all courses with filters",
    description: "Retrieve published courses filtered by category, level, query string, or instructor ID.",
    queryParams: [
      { name: "category", description: "Category slug (e.g. web-development, ai-machine-learning)", defaultVal: "" },
      { name: "level", description: "BEGINNER, INTERMEDIATE, or ADVANCED", defaultVal: "" },
      { name: "q", description: "Search term for title/description", defaultVal: "" },
    ],
  },
  {
    id: "post_courses",
    tag: "Courses",
    method: "POST",
    path: "/api/courses",
    summary: "Create a new course",
    description: "Create an enterprise course with slugification, pricing, level, and category link.",
    defaultBody: JSON.stringify(
      {
        title: "Microservices with Next.js 16 & Docker",
        subtitle: "Build containerized enterprise architectures",
        description: "Master distributed patterns, database connection pooling, and Docker CI/CD.",
        level: "INTERMEDIATE",
        price: 79.99,
        categoryId: "cat_web",
        instructorId: "usr_instructor_1",
      },
      null,
      2
    ),
  },
  {
    id: "get_course_id",
    tag: "Courses",
    method: "GET",
    path: "/api/courses/{id}",
    summary: "Get single course with curriculum & reviews",
    description: "Retrieve comprehensive course details including modules, lessons, and student reviews.",
    pathParams: [{ name: "id", description: "Course ID or slug", defaultVal: "crs_nextjs_microservices" }],
  },
  {
    id: "put_course_id",
    tag: "Courses",
    method: "PUT",
    path: "/api/courses/{id}",
    summary: "Update course details",
    description: "Modify title, subtitle, description, price, or publishing status.",
    pathParams: [{ name: "id", description: "Course ID", defaultVal: "crs_nextjs_microservices" }],
    defaultBody: JSON.stringify(
      {
        title: "Production Next.js 16 & Microservices Architecture (Updated)",
        price: 84.99,
        isPublished: true,
      },
      null,
      2
    ),
  },
  {
    id: "delete_course_id",
    tag: "Courses",
    method: "DELETE",
    path: "/api/courses/{id}",
    summary: "Delete a course",
    description: "Remove a course and its associated modules from the catalog.",
    pathParams: [{ name: "id", description: "Course ID", defaultVal: "crs_temp" }],
  },

  // Curriculum
  {
    id: "post_course_module",
    tag: "Curriculum",
    method: "POST",
    path: "/api/courses/{id}/modules",
    summary: "Add module to a course",
    description: "Create a new curriculum module containing sequenced lessons.",
    pathParams: [{ name: "id", description: "Course ID", defaultVal: "crs_nextjs_microservices" }],
    defaultBody: JSON.stringify(
      {
        title: "Module 2: Containerization & Zero-Downtime Deployment",
        orderIndex: 2,
      },
      null,
      2
    ),
  },
  {
    id: "post_module_lesson",
    tag: "Curriculum",
    method: "POST",
    path: "/api/modules/{id}/lessons",
    summary: "Add lesson to a module",
    description: "Append a lesson with Markdown content, duration, and free preview toggle.",
    pathParams: [{ name: "id", description: "Module ID", defaultVal: "mod_1" }],
    defaultBody: JSON.stringify(
      {
        title: "Deploying Multi-Stage Docker Containers",
        description: "Optimizing Alpine Linux images for sub-100MB production bundles.",
        content: "# Docker Optimization\n\nLearn multi-stage builds and non-root execution.",
        durationMinutes: 28,
        isFreePreview: false,
      },
      null,
      2
    ),
  },
  {
    id: "get_lesson_id",
    tag: "Curriculum",
    method: "GET",
    path: "/api/lessons/{id}",
    summary: "Get lesson details and navigation",
    description: "Fetch lesson content, parent module, and previous/next lesson navigation links.",
    pathParams: [{ name: "id", description: "Lesson ID or slug", defaultVal: "les_1" }],
  },
  {
    id: "put_lesson_id",
    tag: "Curriculum",
    method: "PUT",
    path: "/api/lessons/{id}",
    summary: "Update lesson content",
    description: "Update lesson title, Markdown content, duration, or preview flag.",
    pathParams: [{ name: "id", description: "Lesson ID", defaultVal: "les_1" }],
    defaultBody: JSON.stringify(
      {
        title: "Next.js 16 App Router Paradigm Shift (Deep Dive)",
        durationMinutes: 30,
        isFreePreview: true,
      },
      null,
      2
    ),
  },

  // Learning & Progress
  {
    id: "get_enroll",
    tag: "Learning",
    method: "GET",
    path: "/api/enroll",
    summary: "List student enrollments",
    description: "Retrieve all courses the student is currently enrolled in with completion %.",
    queryParams: [{ name: "userId", description: "User ID", defaultVal: "usr_student_1" }],
  },
  {
    id: "post_enroll",
    tag: "Learning",
    method: "POST",
    path: "/api/enroll",
    summary: "Enroll in a course",
    description: "Register a user into a course to start tracking lesson progress.",
    defaultBody: JSON.stringify(
      {
        userId: "usr_student_1",
        courseId: "crs_applied_llm",
      },
      null,
      2
    ),
  },
  {
    id: "get_progress",
    tag: "Learning",
    method: "GET",
    path: "/api/progress",
    summary: "Get student progress records",
    description: "Retrieve granular lesson completion records and playback timestamps.",
    queryParams: [
      { name: "userId", description: "User ID", defaultVal: "usr_student_1" },
      { name: "courseId", description: "Optional course filter", defaultVal: "crs_nextjs_microservices" },
    ],
  },
  {
    id: "post_progress",
    tag: "Learning",
    method: "POST",
    path: "/api/progress",
    summary: "Record lesson progress",
    description: "Mark a lesson completed and automatically recalculate overall course completion percentage.",
    defaultBody: JSON.stringify(
      {
        userId: "usr_student_1",
        lessonId: "les_2",
        isCompleted: true,
        lastPositionSeconds: 2280,
      },
      null,
      2
    ),
  },

  // Reviews
  {
    id: "get_course_reviews",
    tag: "Reviews",
    method: "GET",
    path: "/api/courses/{id}/reviews",
    summary: "Get reviews for course",
    description: "Fetch student ratings and testimonials for a specific course.",
    pathParams: [{ name: "id", description: "Course ID", defaultVal: "crs_nextjs_microservices" }],
  },
  {
    id: "post_course_reviews",
    tag: "Reviews",
    method: "POST",
    path: "/api/courses/{id}/reviews",
    summary: "Submit review and rating",
    description: "Post a 1 to 5 star rating and comment for a course.",
    pathParams: [{ name: "id", description: "Course ID", defaultVal: "crs_applied_llm" }],
    defaultBody: JSON.stringify(
      {
        userId: "usr_student_1",
        rating: 5,
        comment: "The hybrid search RRF reranking module is truly world-class!",
      },
      null,
      2
    ),
  },

  // Categories
  {
    id: "get_categories",
    tag: "Categories",
    method: "GET",
    path: "/api/categories",
    summary: "List all categories",
    description: "Fetch all course categories along with course counts.",
  },
  {
    id: "post_categories",
    tag: "Categories",
    method: "POST",
    path: "/api/categories",
    summary: "Create a new category",
    description: "Add a new category taxonomy with slugification and custom icon tag.",
    defaultBody: JSON.stringify(
      {
        name: "Cybersecurity & DevSecOps",
        description: "Zero trust security, vulnerability scanning, and Docker CIS hardening.",
        icon: "shield",
      },
      null,
      2
    ),
  },

  // Users & Auth
  {
    id: "get_users",
    tag: "Users & Auth",
    method: "GET",
    path: "/api/users",
    summary: "List users directory",
    description: "Retrieve users directory with role-based filtering (STUDENT, INSTRUCTOR, ADMIN).",
    queryParams: [{ name: "role", description: "Filter by role", defaultVal: "" }],
  },
  {
    id: "get_user_profile",
    tag: "Users & Auth",
    method: "GET",
    path: "/api/users/{id}",
    summary: "Get user profile",
    description: "Fetch detailed user profile including created courses and active enrollments.",
    pathParams: [{ name: "id", description: "User ID", defaultVal: "usr_student_1" }],
  },
  {
    id: "get_session",
    tag: "Users & Auth",
    method: "GET",
    path: "/api/auth/session",
    summary: "Get current session",
    description: "Check active authentication session and simulate switching roles.",
    queryParams: [{ name: "role", description: "Simulate role (STUDENT | INSTRUCTOR | ADMIN)", defaultVal: "STUDENT" }],
  },
  {
    id: "post_session",
    tag: "Users & Auth",
    method: "POST",
    path: "/api/auth/session",
    summary: "Authenticate or switch role",
    description: "Simulate role switching token generation for interactive testing.",
    defaultBody: JSON.stringify({ role: "INSTRUCTOR" }, null, 2),
  },

  // AI & Search
  {
    id: "post_answer",
    tag: "AI & Search",
    method: "POST",
    path: "/api/answer",
    summary: "Execute RAG answer pipeline",
    description: "Retrieve documentation chunks and synthesize answer with local Ollama or fallback LLM.",
    defaultBody: JSON.stringify(
      {
        question: "How do I create path parameters with type hints in FastAPI?",
        model: "llama3.2:3b",
        topK: 5,
      },
      null,
      2
    ),
  },
  {
    id: "get_search",
    tag: "AI & Search",
    method: "GET",
    path: "/api/search",
    summary: "Hybrid search across docs",
    description: "Execute BM25 keyword + semantic vector hybrid search with RRF reranking.",
    queryParams: [{ name: "q", description: "Search query", defaultVal: "FastAPI dependency injection" }],
  },

  // Code Sandbox
  {
    id: "post_sandbox",
    tag: "Code Sandbox",
    method: "POST",
    path: "/api/sandbox",
    summary: "Run Python code in Docker sandbox",
    description: "Execute arbitrary Python code in isolated container with security limits.",
    defaultBody: JSON.stringify(
      {
        code: "import sys\nprint(f'Python version: {sys.version}')\nfor i in range(1, 6):\n    print(f'Step {i}: OK')",
        timeout: 10,
      },
      null,
      2
    ),
  },

  // System
  {
    id: "get_health",
    tag: "System",
    method: "GET",
    path: "/api/health",
    summary: "Health status check",
    description: "Verify PostgreSQL database connection, uptime, and memory usage.",
  },
  {
    id: "get_stats",
    tag: "System",
    method: "GET",
    path: "/api/stats",
    summary: "Platform database metrics",
    description: "Retrieve count of courses, lessons, users, doc pages, and evaluations.",
  },
  {
    id: "get_openapi",
    tag: "System",
    method: "GET",
    path: "/api/openapi.json",
    summary: "Export OpenAPI 3.1 specification",
    description: "Download machine-readable OpenAPI 3.1.0 JSON schema for the entire platform.",
  },
];

const TAGS = [
  "All",
  "Courses",
  "Curriculum",
  "Learning",
  "Reviews",
  "Categories",
  "Users & Auth",
  "AI & Search",
  "Code Sandbox",
  "System",
];

export default function ApiDocsExplorer() {
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEndpointId, setActiveEndpointId] = useState<string>("get_courses");

  // Dynamic state for inputs
  const [paramValues, setParamValues] = useState<Record<string, Record<string, string>>>({
    get_courses: { category: "", level: "", q: "" },
    get_course_id: { id: "crs_nextjs_microservices" },
    put_course_id: { id: "crs_nextjs_microservices" },
    delete_course_id: { id: "crs_temp" },
    post_course_module: { id: "crs_nextjs_microservices" },
    post_module_lesson: { id: "mod_1" },
    get_lesson_id: { id: "les_1" },
    put_lesson_id: { id: "les_1" },
    get_enroll: { userId: "usr_student_1" },
    get_progress: { userId: "usr_student_1", courseId: "crs_nextjs_microservices" },
    get_course_reviews: { id: "crs_nextjs_microservices" },
    post_course_reviews: { id: "crs_applied_llm" },
    get_user_profile: { id: "usr_student_1" },
    get_session: { role: "STUDENT" },
    get_search: { q: "FastAPI dependency injection" },
  });

  const [bodyValues, setBodyValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    ENDPOINTS.forEach((ep) => {
      if (ep.defaultBody) initial[ep.id] = ep.defaultBody;
    });
    return initial;
  });

  const [responses, setResponses] = useState<
    Record<
      string,
      {
        status: number;
        statusText: string;
        data: any;
        durationMs: number;
        timestamp: string;
      }
    >
  >({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);

  // Filtered endpoints
  const filteredEndpoints = ENDPOINTS.filter((ep) => {
    const matchesTag = selectedTag === "All" || ep.tag === selectedTag;
    const matchesSearch =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const activeEndpoint = ENDPOINTS.find((ep) => ep.id === activeEndpointId) || ENDPOINTS[0];

  // Helper to build resolved URL
  const buildResolvedUrl = (ep: EndpointSpec) => {
    let resolved = ep.path;
    const currentParams = paramValues[ep.id] || {};

    if (ep.pathParams) {
      ep.pathParams.forEach((p) => {
        const val = currentParams[p.name] !== undefined ? currentParams[p.name] : p.defaultVal;
        resolved = resolved.replace(`{${p.name}}`, encodeURIComponent(val));
      });
    }

    if (ep.queryParams) {
      const searchParams = new URLSearchParams();
      ep.queryParams.forEach((p) => {
        const val = currentParams[p.name] !== undefined ? currentParams[p.name] : p.defaultVal;
        if (val && val.trim() !== "") {
          searchParams.append(p.name, val.trim());
        }
      });
      const queryString = searchParams.toString();
      if (queryString) resolved += `?${queryString}`;
    }

    return resolved;
  };

  // Execute request
  const handleExecute = async (ep: EndpointSpec) => {
    setLoading((prev) => ({ ...prev, [ep.id]: true }));
    const startTime = performance.now();
    const url = buildResolvedUrl(ep);

    try {
      const options: RequestInit = {
        method: ep.method,
        headers: {},
      };

      if (ep.method !== "GET" && ep.method !== "DELETE") {
        options.headers = { "Content-Type": "application/json" };
        const bodyContent = bodyValues[ep.id] || ep.defaultBody || "{}";
        options.body = bodyContent;
      }

      const res = await fetch(url, options);
      const durationMs = Math.round(performance.now() - startTime);
      let data: any;

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponses((prev) => ({
        ...prev,
        [ep.id]: {
          status: res.status,
          statusText: res.statusText || (res.ok ? "OK" : "Error"),
          data,
          durationMs,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      setResponses((prev) => ({
        ...prev,
        [ep.id]: {
          status: 500,
          statusText: "Client Fetch Error",
          data: { error: err.message || "Failed to complete request" },
          durationMs,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [ep.id]: false }));
    }
  };

  // Generate cURL command
  const getCurlCommand = (ep: EndpointSpec) => {
    const url = `http://localhost:3000${buildResolvedUrl(ep)}`;
    if (ep.method === "GET") {
      return `curl -X GET "${url}" -H "Accept: application/json"`;
    }
    const body = (bodyValues[ep.id] || ep.defaultBody || "").replace(/\n/g, " ");
    return `curl -X ${ep.method} "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${body}'`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCurl(id);
    setTimeout(() => setCopiedCurl(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "rgba(16, 185, 129, 0.4)" };
      case "POST":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.4)" };
      case "PUT":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.4)" };
      case "DELETE":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", border: "rgba(239, 68, 68, 0.4)" };
      default:
        return { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af", border: "rgba(156, 163, 175, 0.4)" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Banner and Quick Links */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1.25rem 1.5rem",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span className="badge badge-success" style={{ fontSize: "0.85rem", padding: "0.35rem 0.8rem" }}>
            OpenAPI 3.1.0 Ready
          </span>
          <span className="badge" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
            Next.js 16 App Router
          </span>
          <span className="badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
            PostgreSQL + In-Memory Fallbacks
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "0.45rem 1rem", textDecoration: "none" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download openapi.json
          </a>
          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.9rem", textDecoration: "none" }}
          >
            Health Check &rarr;
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Tag Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
            scrollbarWidth: "thin",
          }}
        >
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                fontWeight: 600,
                border: selectedTag === t ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                background: selectedTag === t ? "rgba(99, 102, 241, 0.2)" : "var(--bg-secondary)",
                color: selectedTag === t ? "var(--accent-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {t} {t === "All" ? `(${ENDPOINTS.length})` : `(${ENDPOINTS.filter((e) => e.tag === t).length})`}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search API endpoints (e.g. /courses, enroll, sandbox, search)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.6rem",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Endpoints Directory list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
            maxHeight: "800px",
            overflowY: "auto",
            paddingRight: "0.35rem",
          }}
        >
          {filteredEndpoints.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
              No endpoints found matching your query.
            </div>
          ) : (
            filteredEndpoints.map((ep) => {
              const methodStyle = getMethodColor(ep.method);
              const isActive = activeEndpoint.id === ep.id;
              const hasResponse = !!responses[ep.id];

              return (
                <div
                  key={ep.id}
                  onClick={() => setActiveEndpointId(ep.id)}
                  style={{
                    padding: "0.75rem 0.9rem",
                    borderRadius: "var(--radius-md)",
                    background: isActive ? "rgba(99, 102, 241, 0.12)" : "var(--bg-card)",
                    border: isActive ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          background: methodStyle.bg,
                          color: methodStyle.text,
                          border: `1px solid ${methodStyle.border}`,
                          fontFamily: "monospace",
                        }}
                      >
                        {ep.method}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: isActive ? "#ffffff" : "var(--text-primary)",
                          fontFamily: "monospace",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "180px",
                        }}
                      >
                        {ep.path}
                      </span>
                    </div>

                    {hasResponse && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "0.1rem 0.4rem",
                          borderRadius: "4px",
                          background: responses[ep.id].status < 400 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: responses[ep.id].status < 400 ? "#10b981" : "#ef4444",
                        }}
                      >
                        {responses[ep.id].status}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.3 }}>
                    {ep.summary}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Endpoint Interactive Console */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header of Active Endpoint */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "6px",
                    background: getMethodColor(activeEndpoint.method).bg,
                    color: getMethodColor(activeEndpoint.method).text,
                    border: `1px solid ${getMethodColor(activeEndpoint.method).border}`,
                    fontFamily: "monospace",
                  }}
                >
                  {activeEndpoint.method}
                </span>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "monospace", color: "var(--text-primary)" }}>
                  {activeEndpoint.path}
                </span>
              </div>
              <span className="badge" style={{ background: "rgba(255, 255, 255, 0.05)", color: "var(--text-secondary)" }}>
                {activeEndpoint.tag}
              </span>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
              {activeEndpoint.description}
            </p>
          </div>

          {/* Interactive Parameters Configuration */}
          {(activeEndpoint.pathParams || activeEndpoint.queryParams) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <h4 style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                Parameters
              </h4>
              <div
                style={{
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                }}
              >
                {/* Path Params */}
                {activeEndpoint.pathParams?.map((p) => {
                  const curr = paramValues[activeEndpoint.id]?.[p.name] !== undefined
                    ? paramValues[activeEndpoint.id][p.name]
                    : p.defaultVal;

                  return (
                    <div
                      key={p.name}
                      style={{
                        padding: "0.75rem 1rem",
                        display: "grid",
                        gridTemplateColumns: "140px 1fr",
                        gap: "1rem",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                          {p.name} <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>*path</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{p.description}</div>
                      </div>
                      <input
                        type="text"
                        value={curr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParamValues((prev) => ({
                            ...prev,
                            [activeEndpoint.id]: {
                              ...(prev[activeEndpoint.id] || {}),
                              [p.name]: val,
                            },
                          }));
                        }}
                        style={{
                          width: "100%",
                          padding: "0.45rem 0.75rem",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-primary)",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          outline: "none",
                        }}
                      />
                    </div>
                  );
                })}

                {/* Query Params */}
                {activeEndpoint.queryParams?.map((q) => {
                  const curr = paramValues[activeEndpoint.id]?.[q.name] !== undefined
                    ? paramValues[activeEndpoint.id][q.name]
                    : q.defaultVal;

                  return (
                    <div
                      key={q.name}
                      style={{
                        padding: "0.75rem 1rem",
                        display: "grid",
                        gridTemplateColumns: "140px 1fr",
                        gap: "1rem",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                          {q.name} <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>query</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{q.description}</div>
                      </div>
                      <input
                        type="text"
                        placeholder={`e.g. ${q.defaultVal || "optional"}`}
                        value={curr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParamValues((prev) => ({
                            ...prev,
                            [activeEndpoint.id]: {
                              ...(prev[activeEndpoint.id] || {}),
                              [q.name]: val,
                            },
                          }));
                        }}
                        style={{
                          width: "100%",
                          padding: "0.45rem 0.75rem",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-primary)",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          outline: "none",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Request Body Editor for POST/PUT */}
          {(activeEndpoint.method === "POST" || activeEndpoint.method === "PUT") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                  Request Payload (JSON)
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (activeEndpoint.defaultBody) {
                      setBodyValues((prev) => ({ ...prev, [activeEndpoint.id]: activeEndpoint.defaultBody! }));
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent-primary)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset Sample
                </button>
              </div>
              <textarea
                rows={7}
                value={bodyValues[activeEndpoint.id] !== undefined ? bodyValues[activeEndpoint.id] : (activeEndpoint.defaultBody || "{}")}
                onChange={(e) => {
                  const val = e.target.value;
                  setBodyValues((prev) => ({ ...prev, [activeEndpoint.id]: val }));
                }}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  background: "#0f172a",
                  color: "#38bdf8",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  outline: "none",
                  lineHeight: 1.45,
                }}
              />
            </div>
          )}

          {/* Action Row: Send Request + Copy cURL */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => handleExecute(activeEndpoint)}
                disabled={loading[activeEndpoint.id]}
                className="btn btn-primary"
                style={{ padding: "0.65rem 1.4rem", fontSize: "0.95rem" }}
              >
                {loading[activeEndpoint.id] ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    Executing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Send Request
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(getCurlCommand(activeEndpoint), activeEndpoint.id)}
                className="btn btn-outline"
                style={{ padding: "0.65rem 1rem", fontSize: "0.85rem" }}
              >
                {copiedCurl === activeEndpoint.id ? "Copied cURL!" : "Copy cURL"}
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "monospace" }}>
              Target: <span style={{ color: "var(--text-primary)" }}>{buildResolvedUrl(activeEndpoint)}</span>
            </div>
          </div>

          {/* Live Response Panel */}
          {responses[activeEndpoint.id] && (
            <div
              style={{
                marginTop: "0.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "4px",
                      background: responses[activeEndpoint.id].status < 400 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      color: responses[activeEndpoint.id].status < 400 ? "#10b981" : "#ef4444",
                      border: responses[activeEndpoint.id].status < 400 ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    {responses[activeEndpoint.id].status} {responses[activeEndpoint.id].statusText}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Time: <strong style={{ color: "var(--text-primary)" }}>{responses[activeEndpoint.id].durationMs} ms</strong>
                  </span>
                </div>

                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  {responses[activeEndpoint.id].timestamp}
                </span>
              </div>

              <div
                style={{
                  background: "#090d16",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  maxHeight: "420px",
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    color: "#a7f3d0",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    lineHeight: 1.45,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {typeof responses[activeEndpoint.id].data === "string"
                    ? responses[activeEndpoint.id].data
                    : JSON.stringify(responses[activeEndpoint.id].data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
