import Link from "next/link";
import StatusMonitor from "./components/StatusMonitor";

export default function Home() {
  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "4rem" }}>
      {/* Hero Section */}
      <section style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{ display: "inline-flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap", justifyContent: "center" }}>
          <span className="badge badge-info">Next.js 16 App Router</span>
          <span className="badge badge-purple">PostgreSQL 16</span>
          <span className="badge badge-success">Prisma ORM 6.4</span>
          <span className="badge badge-warning">Docker Compose</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            maxWidth: "920px",
            margin: "0 auto 1.25rem auto",
          }}
        >
          Enterprise LMS Foundation with{" "}
          <span className="gradient-text">PostgreSQL &amp; Docker</span>
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            maxWidth: "680px",
            margin: "0 auto 2rem auto",
            lineHeight: 1.6,
          }}
        >
          A scalable, containerized educational technology skeleton featuring relational
          schema modeling for courses, lessons, student progress tracking, and zero-downtime database orchestration.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/courses" className="btn btn-primary">
            Explore Course Catalog
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link href="/docs/fastapi" className="btn btn-secondary">
            ⚡ FastAPI Docs Hub
          </Link>
          <Link href="/search" className="btn btn-secondary">
            🔍 Hybrid Search &amp; Reranker
          </Link>
          <Link href="/ask" className="btn btn-secondary">
            🤖 AI Answer Assistant
          </Link>
          <Link href="/sandbox" className="btn btn-secondary">
            🐳 Docker Sandbox
          </Link>
          <a href="#docker-architecture" className="btn btn-secondary">
            View Docker Stack
          </a>
          <a href="#quickstart" className="btn btn-secondary">
            Quickstart Commands
          </a>
        </div>
      </section>

      {/* Live Telemetry / Database Monitor */}
      <StatusMonitor />

      {/* Docker Architecture Section */}
      <section id="docker-architecture" style={{ marginBottom: "4.5rem", scrollMarginTop: "5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="badge badge-purple" style={{ marginBottom: "0.75rem" }}>
            Container Topology
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Docker Compose Orchestration
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0.5rem auto 0" }}>
            Fully isolated multi-container setup with automated health checks, internal networking, and persistent storage volumes.
          </p>
        </div>

        <div className="grid-3">
          {/* Service 1: Next.js */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(6, 182, 212, 0.15)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-cyan)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Service: app</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Next.js 16 Standalone</span>
              </div>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Multi-stage Alpine image running the production Next.js App Router server on port 3000. Depends on healthy PostgreSQL service.
            </p>
            <ul style={{ listStyle: "none", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <li>• Target port: <code>3000:3000</code></li>
              <li>• Alpine multi-stage builder</li>
              <li>• Unprivileged <code>nextjs</code> system user</li>
            </ul>
          </div>

          {/* Service 2: PostgreSQL */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-indigo)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Service: db</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PostgreSQL 16 Alpine</span>
              </div>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Official PostgreSQL 16 image configured with automatic healthchecks (<code>pg_isready</code>) and named volume persistence.
            </p>
            <ul style={{ listStyle: "none", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <li>• Exposed port: <code>5432:5432</code></li>
              <li>• Persistent Volume: <code>edutech_postgres_data</code></li>
              <li>• Automated 5s interval healthcheck</li>
            </ul>
          </div>

          {/* Service 3: Database Setup Tool */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-emerald)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Profile: tools</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Migration &amp; Seed Container</span>
              </div>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              One-off container executing Prisma schema push and TypeScript seed runner inside the shared Docker network.
            </p>
            <ul style={{ listStyle: "none", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <li>• Runs <code>prisma db push</code></li>
              <li>• Executes <code>prisma/seed.ts</code> via tsx</li>
              <li>• Automatically connects to <code>db:5432</code></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Prisma Schema & Relational Models Section */}
      <section id="schema-reference" style={{ marginBottom: "4.5rem", scrollMarginTop: "5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="badge badge-info" style={{ marginBottom: "0.75rem" }}>
            Database Modeling
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Core LMS Domain Schema
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "640px", margin: "0.5rem auto 0" }}>
            Relational PostgreSQL models designed for educational platforms: users, roles, categories, courses, modules, lessons, enrollments, and progress tracking.
          </p>
        </div>

        <div className="grid-2">
          {/* Column 1: Models Overview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong style={{ color: "#fff", fontSize: "1.05rem" }}>👤 User &amp; Roles</strong>
                <span className="badge badge-purple">STUDENT | INSTRUCTOR | ADMIN</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Stores authentication credentials, role capabilities, profile bios, and avatars. Has 1-to-many relations with authored courses, enrollments, and lesson progress.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong style={{ color: "#fff", fontSize: "1.05rem" }}>📚 Course &amp; Categories</strong>
                <span className="badge badge-info">Relational Hierarchy</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Courses feature unique URL slugs, difficulty levels (BEGINNER, INTERMEDIATE, ADVANCED), pricing, publication flags, and nested curriculum modules.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong style={{ color: "#fff", fontSize: "1.05rem" }}>🧩 Modules &amp; Lessons</strong>
                <span className="badge badge-success">Ordered Curriculum</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Modules group lessons by index. Lessons contain video URLs, rich Markdown content, duration estimates, and free preview options for prospective students.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong style={{ color: "#fff", fontSize: "1.05rem" }}>📈 Enrollment &amp; Lesson Progress</strong>
                <span className="badge badge-warning">Granular Tracking</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Tracks student enrollment statuses (ACTIVE, COMPLETED), aggregate progress percentage, individual lesson completion timestamps, and last video playback offsets.
              </p>
            </div>
          </div>

          {/* Column 2: Prisma Schema Code Snippet */}
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                📄 prisma/schema.prisma (Excerpt)
              </span>
              <span className="badge badge-info">PostgreSQL</span>
            </div>
            <pre className="code-box" style={{ flex: 1, margin: 0, fontSize: "0.8rem", lineHeight: "1.5" }}>
{`model Course {
  id           String       @id @default(cuid())
  title        String
  slug         String       @unique
  description  String       @db.Text
  level        CourseLevel  @default(BEGINNER)
  price        Decimal      @default(0.00) @db.Decimal(10, 2)
  isPublished  Boolean      @default(false)

  instructorId String
  instructor   User         @relation(fields: [instructorId], references: [id])

  categoryId   String?
  category     Category?    @relation(fields: [categoryId], references: [id])

  modules      Module[]
  enrollments  Enrollment[]
  reviews      Review[]

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Enrollment {
  id              String           @id @default(cuid())
  userId          String
  courseId        String
  status          EnrollmentStatus @default(ACTIVE)
  progressPercent Float            @default(0.0)

  user            User             @relation(fields: [userId], references: [id])
  course          Course           @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Quickstart & Commands Section */}
      <section id="quickstart" style={{ marginBottom: "4.5rem", scrollMarginTop: "5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="badge badge-success" style={{ marginBottom: "0.75rem" }}>
            Developer Guide
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            How to Run &amp; Orchestrate
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0.5rem auto 0" }}>
            Choose whether to run the entire stack in Docker or run the database in Docker while using hot-reload for Next.js development.
          </p>
        </div>

        <div className="grid-2">
          {/* Option A: Full Docker Stack */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span className="badge badge-purple">Workflow 1</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Run Entire Stack in Docker</h3>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Spins up the PostgreSQL database and standalone Next.js container together.
            </p>
            <div className="code-box" style={{ marginBottom: "1rem" }}>
              <div style={{ color: "var(--text-muted)" }}># 1. Start database and app</div>
              <div>docker compose up -d</div>
              <br />
              <div style={{ color: "var(--text-muted)" }}># 2. Push schema &amp; seed database</div>
              <div>docker compose --profile tools run --rm db-setup</div>
              <br />
              <div style={{ color: "var(--text-muted)" }}># 3. View live app</div>
              <div style={{ color: "var(--accent-cyan)" }}>http://localhost:3000</div>
            </div>
          </div>

          {/* Option B: Local Dev + Docker DB */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span className="badge badge-info">Workflow 2 (Fast Iteration)</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Local Next.js + Docker PostgreSQL</h3>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Runs PostgreSQL in Docker for persistence while running Next.js locally with hot-reloading.
            </p>
            <div className="code-box" style={{ marginBottom: "1rem" }}>
              <div style={{ color: "var(--text-muted)" }}># 1. Start only PostgreSQL</div>
              <div>docker compose up -d db</div>
              <br />
              <div style={{ color: "var(--text-muted)" }}># 2. Push schema &amp; seed locally</div>
              <div>npm run prisma:push</div>
              <div>npm run prisma:seed</div>
              <br />
              <div style={{ color: "var(--text-muted)" }}># 3. Start Next.js dev server</div>
              <div>npm run dev</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section style={{ marginBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="badge badge-info" style={{ marginBottom: "0.5rem" }}>
              Sample Domain Data
            </span>
            <h2 style={{ fontSize: "1.85rem", fontWeight: 700 }}>Featured LMS Courses</h2>
          </div>
          <Link href="/courses" className="btn btn-secondary btn-sm">
            View All Courses &rarr;
          </Link>
        </div>

        <div className="grid-3">
          {/* Course Card 1 */}
          <div className="glass-panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                height: "160px",
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                <span className="badge badge-purple">ADVANCED</span>
              </div>
            </div>
            <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontWeight: 600, textTransform: "uppercase" }}>
                Full-Stack Web Development
              </span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.4rem 0 0.6rem 0", color: "#fff" }}>
                Production Next.js 16 &amp; Microservices Architecture
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem", flex: 1 }}>
                Build enterprise-scale full-stack applications with Next.js, Docker, PostgreSQL, and Redis.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>$89.99</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>2 Modules • 4 Lessons</span>
              </div>
            </div>
          </div>

          {/* Course Card 2 */}
          <div className="glass-panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                height: "160px",
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                <span className="badge badge-info">INTERMEDIATE</span>
              </div>
            </div>
            <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-purple)", fontWeight: 600, textTransform: "uppercase" }}>
                AI &amp; Machine Learning
              </span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.4rem 0 0.6rem 0", color: "#fff" }}>
                Applied LLM Engineering &amp; Agentic Systems
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem", flex: 1 }}>
                Build resilient AI agents, semantic retrieval pipelines, and vector databases from scratch.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>$99.99</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>1 Module • 2 Lessons</span>
              </div>
            </div>
          </div>

          {/* Course Card 3 */}
          <div className="glass-panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                height: "160px",
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                <span className="badge badge-success">BEGINNER</span>
              </div>
            </div>
            <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", fontWeight: 600, textTransform: "uppercase" }}>
                Cloud &amp; DevOps
              </span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.4rem 0 0.6rem 0", color: "#fff" }}>
                Docker &amp; Container Mastery for Developers
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem", flex: 1 }}>
                Zero to hero containerization, Docker Compose orchestration, multi-stage builds, and security.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>$49.99</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>1 Module • 1 Lesson</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REST API Endpoints Reference */}
      <section className="glass-panel" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Integrated REST API Endpoints
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Ready-to-consume backend routes querying PostgreSQL via Prisma ORM:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)" }}>
            <span className="badge badge-success">GET</span>
            <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>/api/health</code>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", flex: 1 }}>
              Verifies PostgreSQL connection, uptime, and database entity counts.
            </span>
            <a href="/api/health" target="_blank" className="btn btn-secondary btn-sm">Test</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)" }}>
            <span className="badge badge-success">GET</span>
            <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>/api/courses</code>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", flex: 1 }}>
              Queries published courses, modules, lessons, and average student ratings.
            </span>
            <a href="/api/courses" target="_blank" className="btn btn-secondary btn-sm">Test</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)" }}>
            <span className="badge badge-success">GET</span>
            <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>/api/stats</code>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", flex: 1 }}>
              Returns aggregate counts for students, instructors, courses, and enrollments.
            </span>
            <a href="/api/stats" target="_blank" className="btn btn-secondary btn-sm">Test</a>
          </div>
        </div>
      </section>
    </div>
  );
}
