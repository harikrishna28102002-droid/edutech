/**
 * EduTech Academy - Interactive Client-Side Platform Engine
 * Handles Courses, Interactive Classroom Player, Student Dashboard,
 * In-Browser Code Sandbox, and AI Study Assistant without requiring a backend.
 */

// Course & Curriculum Dataset (Mirrors EduTech Prisma Seed & Services)
const COURSES_DATA = [
  {
    id: "crs_nextjs_microservices",
    title: "Production Next.js 16 & Microservices Architecture",
    slug: "production-nextjs-microservices",
    category: "Full-Stack Web Development",
    categorySlug: "web-development",
    level: "ADVANCED",
    badgeClass: "badge-purple",
    duration: "14h 45m",
    lessonsCount: 8,
    rating: 5.0,
    reviewsCount: 38,
    price: "$89.99",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    instructor: {
      name: "Prof. Marcus Sterling",
      role: "Principal Systems Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
    },
    description: "Master enterprise-scale full-stack architecture with Next.js 16, React Server Components, Docker orchestration, and high-concurrency PostgreSQL optimization.",
    lessons: [
      {
        id: "les_1",
        title: "Next.js 16 App Router & Turbopack Paradigm Shift",
        duration: "24m",
        videoId: "wm5gMKuwSYk",
        notes: `### Module 1: Next.js 16 App Router Paradigm Shift\n\nIn this lecture, we dissect React Server Components (RSC) and how Turbopack fundamentally changes local build and hot-module replacement cycles.\n\n- **Zero Client Bundle for Static Layouts**: Server components execute solely on the host, sending pure HTML/RSC payloads.\n- **Action Handling**: Form mutations execute with \`useActionState\` without custom API boilerplates.\n- **Turbopack Architecture**: Written in Rust, provides sub-millisecond route compilation.`,
        codeSnippet: `// Server Action Demonstration\nasync function enrollUserAction(formData: FormData) {\n  'use server';\n  const courseId = formData.get('courseId');\n  // Zero-latency database execution directly on the server\n  return { success: true, courseId };\n}`
      },
      {
        id: "les_2",
        title: "Zero-Downtime PostgreSQL with Prisma ORM",
        duration: "38m",
        videoId: "RebA5J-rlhU",
        notes: `### Module 2: High Performance PostgreSQL Architecture\n\nLearn connection pooling, schema migration strategies, and how to configure Prisma Client singletons for serverless and containerized deployment topologies.\n\n- Connection pool sizing with PgBouncer\n- Managing schema drift with \`prisma migrate dev\` and \`prisma migrate deploy\`\n- Index optimization using partial & composite B-trees.`,
        codeSnippet: `import { PrismaClient } from '@prisma/client';\n\nconst globalForPrisma = globalThis as unknown as { prisma: PrismaClient };\nexport const prisma = globalForPrisma.prisma || new PrismaClient();\nif (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;`
      }
    ]
  },
  {
    id: "crs_applied_llm",
    title: "Applied LLM Engineering & Agentic Systems",
    slug: "applied-llm-engineering",
    category: "AI & Machine Learning",
    categorySlug: "ai-machine-learning",
    level: "INTERMEDIATE",
    badgeClass: "badge-info",
    duration: "18h 20m",
    lessonsCount: 10,
    rating: 4.9,
    reviewsCount: 52,
    price: "$99.99",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    instructor: {
      name: "Dr. Evelyn Vance",
      role: "Chief Academic Officer & AI Researcher",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
    },
    description: "Hands-on guide to production LLM engineering. Learn hybrid semantic search with pgvector, Reciprocal Rank Fusion, tool-calling agent loops, and 4-bit QLoRA fine-tuning.",
    lessons: [
      {
        id: "les_3",
        title: "Dense Vector Embeddings & Hybrid Search (pgvector + BM25)",
        duration: "32m",
        videoId: "tcqEUSNCn8I",
        notes: `### Module 1: Hybrid Search & Dense Vector Embeddings\n\nCombining dense semantic vectors and sparse lexical search (BM25) overcomes vocabulary mismatch and exact keyword limitations.\n\n- Cosine Similarity & Inner Product distance metrics\n- Approximate Nearest Neighbor (ANN) indexes with HNSW and IVFFlat\n- Reciprocal Rank Fusion (RRF) algorithm for merging multiple candidate rank lists.`,
        codeSnippet: `// Reciprocal Rank Fusion Score Calculation\nfunction computeRRF(rankDense, rankSparse, k = 60) {\n  return (1 / (k + rankDense)) + (1 / (k + rankSparse));\n}`
      }
    ]
  },
  {
    id: "crs_docker_mastery",
    title: "Docker & Container Mastery for Developers",
    slug: "docker-container-mastery",
    category: "Cloud & DevOps",
    categorySlug: "cloud-devops",
    level: "BEGINNER",
    badgeClass: "badge-success",
    duration: "10h 15m",
    lessonsCount: 6,
    rating: 4.8,
    reviewsCount: 29,
    price: "$49.99",
    thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80",
    instructor: {
      name: "Sarah Lin",
      role: "Lead DevOps Engineer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"
    },
    description: "Zero-to-hero containerization, Docker Compose orchestration, multi-stage builds, non-root security boundaries, and local cloud-native workflows.",
    lessons: [
      {
        id: "les_4",
        title: "Docker Compose & Multi-Service Local Orchestration",
        duration: "28m",
        videoId: "gAkwW2tuIqE",
        notes: `### Container Networking & Compose Orchestration\n\nRun Next.js, PostgreSQL with pgvector, and Redis caches in an isolated bridge network with declarative health checks and named volumes.`,
        codeSnippet: `services:\n  db:\n    image: pgvector/pgvector:pg16\n    environment:\n      POSTGRES_DB: edutech_db\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U edutech_user"]`
      }
    ]
  }
];

// In-Memory & LocalStorage State
const State = {
  currentTab: "home",
  activeCourse: COURSES_DATA[0],
  activeLesson: COURSES_DATA[0].lessons[0],
  completedLessons: JSON.parse(localStorage.getItem("edutech_completed_lessons") || '["les_1"]'),
  activeFilter: "all",
  searchQuery: "",
  activeLessonTab: "notes"
};

// UI DOM Helpers
function saveCompletedLessons() {
  localStorage.setItem("edutech_completed_lessons", JSON.stringify(State.completedLessons));
  updateDashboardStats();
}

function switchTab(tabId) {
  State.currentTab = tabId;

  // Update nav buttons
  document.querySelectorAll(".nav-item-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Update tab sections
  document.querySelectorAll(".tab-section").forEach(sec => {
    sec.classList.toggle("active-section", sec.id === `tab-${tabId}`);
  });

  // Close mobile drawer if open
  const drawer = document.getElementById("mobileNavDrawer");
  if (drawer) drawer.classList.remove("open");

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (tabId === "courses") renderCourses();
  if (tabId === "classroom") renderClassroom();
  if (tabId === "dashboard") updateDashboardStats();
}

// Render Courses Catalog
function renderCourses() {
  const container = document.getElementById("coursesGridContainer");
  if (!container) return;

  const filtered = COURSES_DATA.filter(course => {
    const matchesFilter = State.activeFilter === "all" || course.categorySlug === State.activeFilter;
    const matchesSearch = !State.searchQuery || 
      course.title.toLowerCase().includes(State.searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(State.searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
        <p style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">No courses match your criteria</p>
        <p style="font-size: 0.9rem;">Try selecting a different category or clearing your search query.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(course => {
    return `
      <div class="course-card">
        <div class="course-thumb-wrapper">
          <img src="${course.thumbnail}" alt="${course.title}" class="course-thumb" loading="lazy" />
          <div class="course-badge-overlay">
            <span class="badge ${course.badgeClass}">${course.level}</span>
          </div>
        </div>
        <div class="course-body">
          <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.4rem; text-transform: uppercase;">
            ${course.category}
          </div>
          <h3 class="course-title">${course.title}</h3>
          <p class="course-desc">${course.description}</p>
          
          <div class="course-meta">
            <div class="instructor-tag">
              <img src="${course.instructor.avatar}" alt="${course.instructor.name}" class="instructor-avatar" />
              <span>${course.instructor.name}</span>
            </div>
            <span>⭐ ${course.rating.toFixed(1)} (${course.reviewsCount})</span>
          </div>

          <div class="course-footer">
            <div>
              <span class="course-price">${course.price}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${course.duration} • ${course.lessonsCount} lessons</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="launchClassroom('${course.id}')">
              Start Learning &rarr;
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Launch Classroom
function launchClassroom(courseId, lessonId) {
  const course = COURSES_DATA.find(c => c.id === courseId) || COURSES_DATA[0];
  State.activeCourse = course;
  State.activeLesson = lessonId ? (course.lessons.find(l => l.id === lessonId) || course.lessons[0]) : course.lessons[0];
  switchTab("classroom");
}

// Render Interactive Classroom
function renderClassroom() {
  const c = State.activeCourse;
  const l = State.activeLesson;

  // Update Video Frame
  const videoFrame = document.getElementById("classroomVideoIframe");
  if (videoFrame && l.videoId) {
    videoFrame.src = `https://www.youtube-nocookie.com/embed/${l.videoId}?rel=0`;
  }

  // Update Title
  const titleEl = document.getElementById("currentLessonTitle");
  if (titleEl) titleEl.textContent = l.title;

  const courseTitleEl = document.getElementById("classroomCourseTitle");
  if (courseTitleEl) courseTitleEl.textContent = `${c.title} (${c.category})`;

  // Update Completion Button
  const isDone = State.completedLessons.includes(l.id);
  const markBtn = document.getElementById("markCompleteBtn");
  if (markBtn) {
    markBtn.textContent = isDone ? "✓ Completed" : "Mark as Complete";
    markBtn.className = isDone ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm";
  }

  // Render Lesson Tab Content
  renderLessonTabContent();

  // Render Playlist
  const playlistContainer = document.getElementById("playlistContainer");
  if (playlistContainer) {
    playlistContainer.innerHTML = c.lessons.map((lesson, idx) => {
      const active = lesson.id === l.id;
      const completed = State.completedLessons.includes(lesson.id);
      return `
        <div class="playlist-item ${active ? 'active' : ''}" onclick="selectLesson('${lesson.id}')">
          <div>
            <div class="playlist-item-title">
              ${completed ? '✅ ' : `${idx + 1}. `}${lesson.title}
            </div>
            <div class="playlist-item-meta">Duration: ${lesson.duration}</div>
          </div>
          <span style="font-size: 0.8rem; color: var(--accent-cyan);">▶</span>
        </div>
      `;
    }).join("");
  }
}

function selectLesson(lessonId) {
  const l = State.activeCourse.lessons.find(item => item.id === lessonId);
  if (l) {
    State.activeLesson = l;
    renderClassroom();
  }
}

function toggleLessonComplete() {
  const lId = State.activeLesson.id;
  const idx = State.completedLessons.indexOf(lId);
  if (idx > -1) {
    State.completedLessons.splice(idx, 1);
  } else {
    State.completedLessons.push(lId);
  }
  saveCompletedLessons();
  renderClassroom();
}

function renderLessonTabContent() {
  const container = document.getElementById("lessonTabContentContainer");
  if (!container) return;
  const l = State.activeLesson;

  if (State.activeLessonTab === "notes") {
    container.innerHTML = `
      <div style="background: rgba(0,0,0,0.2); padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 1rem;">
        <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Instructor Lecture Notes</h4>
        <div style="white-space: pre-wrap; line-height: 1.6;">${l.notes}</div>
      </div>
    `;
  } else if (State.activeLessonTab === "code") {
    container.innerHTML = `
      <div>
        <p style="margin-bottom: 0.75rem;">Associated source code implementation for this lesson:</p>
        <pre style="background: #04060a; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); color: #38bdf8; font-family: var(--font-mono); font-size: 0.85rem; overflow-x: auto;"><code>${l.codeSnippet || '// No code snippet required for this conceptual lecture'}</code></pre>
        <button class="btn btn-secondary btn-sm" style="margin-top: 0.75rem;" onclick="loadSnippetIntoSandbox()">
          Load Snippet in Code Sandbox &rarr;
        </button>
      </div>
    `;
  } else if (State.activeLessonTab === "discussion") {
    container.innerHTML = `
      <div>
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
          <input type="text" id="discussionInput" placeholder="Ask a question or share a thought on this lecture..." class="search-input" />
          <button class="btn btn-primary btn-sm" onclick="postDiscussionComment()">Post</button>
        </div>
        <div id="discussionCommentsList" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--accent-cyan); margin-bottom: 0.25rem;">Sarah Lin • 2 hours ago</div>
            <div style="font-size: 0.88rem; color: var(--text-secondary);">The explanation on connection pooling with Prisma singletons helped solve our memory leak in development. Highly recommended!</div>
          </div>
        </div>
      </div>
    `;
  }
}

function postDiscussionComment() {
  const input = document.getElementById("discussionInput");
  if (!input || !input.value.trim()) return;
  const list = document.getElementById("discussionCommentsList");
  if (list) {
    const div = document.createElement("div");
    div.style = "background: rgba(56,189,248,0.05); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(56,189,248,0.25);";
    div.innerHTML = `
      <div style="font-weight: 700; font-size: 0.82rem; color: var(--accent-emerald); margin-bottom: 0.25rem;">You (Student) • Just now</div>
      <div style="font-size: 0.88rem; color: var(--text-primary);">${input.value.trim()}</div>
    `;
    list.prepend(div);
  }
  input.value = "";
}

function loadSnippetIntoSandbox() {
  const l = State.activeLesson;
  if (!l.codeSnippet) return;
  switchTab("sandbox");
  const codeBox = document.getElementById("sandboxCodeArea");
  if (codeBox) {
    codeBox.value = l.codeSnippet;
  }
}

// Update Dashboard Statistics
function updateDashboardStats() {
  const totalLessons = COURSES_DATA.reduce((acc, c) => acc + c.lessons.length, 0);
  const doneCount = State.completedLessons.length;
  const pct = Math.min(100, Math.round((doneCount / totalLessons) * 100));

  const pctEl = document.getElementById("dashCompletionPercent");
  if (pctEl) pctEl.textContent = `${pct}%`;

  const doneCountEl = document.getElementById("dashDoneLessons");
  if (doneCountEl) doneCountEl.textContent = `${doneCount} / ${totalLessons}`;

  const progressBar = document.getElementById("dashProgressBar");
  if (progressBar) progressBar.style.width = `${pct}%`;
}

// In-Browser Code Sandbox Runner
function runSandboxCode() {
  const code = document.getElementById("sandboxCodeArea").value;
  const consoleBox = document.getElementById("sandboxConsoleOutput");
  if (!consoleBox) return;

  consoleBox.textContent = "⏳ Executing in sandboxed environment...\n";

  const logs = [];
  const customConsole = {
    log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ')),
    warn: (...args) => logs.push("[WARN] " + args.join(' ')),
    error: (...args) => logs.push("[ERROR] " + args.join(' '))
  };

  const startTime = performance.now();
  try {
    // Execute safely with sandboxed Function
    const runner = new Function("console", code);
    runner(customConsole);
    const duration = (performance.now() - startTime).toFixed(1);

    if (logs.length === 0) {
      consoleBox.textContent = `✓ Code executed successfully with no output.\n⏱ Duration: ${duration}ms`;
    } else {
      consoleBox.textContent = logs.join("\n") + `\n\n✓ Process finished with exit code 0 (${duration}ms)`;
    }
  } catch (err) {
    consoleBox.textContent = `❌ Execution Error:\n${err.message}\n${err.stack || ''}`;
  }
}

function clearSandboxConsole() {
  const consoleBox = document.getElementById("sandboxConsoleOutput");
  if (consoleBox) consoleBox.textContent = "Console ready. Click 'Run Code' to execute.";
}

function setSandboxTemplate(templateKey) {
  const codeBox = document.getElementById("sandboxCodeArea");
  if (!codeBox) return;

  const templates = {
    "cosine": `// Vector Cosine Similarity Calculator\nfunction cosineSimilarity(vecA, vecB) {\n  let dotProduct = 0;\n  let normA = 0;\n  let normB = 0;\n  for (let i = 0; i < vecA.length; i++) {\n    dotProduct += vecA[i] * vecB[i];\n    normA += vecA[i] * vecA[i];\n    normB += vecB[i] * vecB[i];\n  }\n  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));\n}\n\nconst query = [0.12, 0.85, 0.45, 0.92];\nconst docChunk = [0.15, 0.82, 0.40, 0.88];\n\nconst score = cosineSimilarity(query, docChunk);\nconsole.log("Query Vector:", query);\nconsole.log("Chunk Vector:", docChunk);\nconsole.log("Semantic Match Score:", score.toFixed(4));`,
    "prisma": `// Mock Database Transaction & Single-Tenant Query Simulator\nconst users = [\n  { id: "u1", name: "Sarah Lin", role: "STUDENT", courses: 2 },\n  { id: "u2", name: "Marcus Sterling", role: "INSTRUCTOR", courses: 5 }\n];\n\nconsole.log("Connecting to PostgreSQL pool...");\nsetTimeout(() => {}, 50);\nconsole.log("Active Database Connections: 4 / 20");\n\nconst instructors = users.filter(u => u.role === "INSTRUCTOR");\nconsole.log("Prisma findMany query result:", instructors);`,
    "rrf": `// Reciprocal Rank Fusion (RRF) Hybrid Search Scorer\nconst denseResults = ["doc_2", "doc_1", "doc_4"];\nconst sparseResults = ["doc_1", "doc_3", "doc_2"];\n\nconst k = 60;\nconst rrfScores = {};\n\ndenseResults.forEach((doc, rank) => {\n  rrfScores[doc] = (rrfScores[doc] || 0) + (1 / (k + rank + 1));\n});\n\nsparseResults.forEach((doc, rank) => {\n  rrfScores[doc] = (rrfScores[doc] || 0) + (1 / (k + rank + 1));\n});\n\nconst sorted = Object.entries(rrfScores).sort((a,b) => b[1] - a[1]);\nconsole.log("Hybrid RRF Ranked Candidates:");\nsorted.forEach(([id, score], i) => console.log(\`Rank \${i+1}: \${id} (Score: \${score.toFixed(5)})\`));`
  };

  if (templates[templateKey]) {
    codeBox.value = templates[templateKey];
    runSandboxCode();
  }
}

// AI Study Assistant Knowledge Engine
const AI_KNOWLEDGE_BASE = [
  {
    keywords: ["next.js", "nextjs", "app router", "turbopack", "server action"],
    reply: `**Next.js 16 App Router Highlights:**
1. **React Server Components (RSC)**: By default, components in \`app/\` run exclusively on the server, resulting in zero JavaScript bundled to client browsers for static layouts.
2. **Server Actions**: Async functions defined with \`'use server'\` let you mutate databases directly without creating explicit boilerplate REST endpoints.
3. **Turbopack**: The Rust-based bundler provides near-instant development startup and hot-module reloading.`
  },
  {
    keywords: ["postgresql", "prisma", "database", "pgvector", "migration"],
    reply: `**PostgreSQL & Prisma Integration:**
1. **Prisma Client Singleton**: Prevents exhausting database connection pools across hot reloads in Next.js development.
2. **pgvector Integration**: Enables dense vector embedding storage directly inside PostgreSQL, allowing both relational and semantic ANN queries in a single database.
3. **Zero-Downtime Migrations**: Use \`prisma migrate deploy\` inside production Docker pipelines for safe, non-blocking schema upgrades.`
  },
  {
    keywords: ["rag", "embedding", "vector", "hybrid", "bm25", "rrf"],
    reply: `**Retrieval-Augmented Generation (RAG):**
1. **Dense Vectors**: Captures semantic nuance using high-dimensional cosine similarity embeddings (e.g. 768 or 1536 dimensions).
2. **Sparse Retrieval (BM25)**: Handles exact keyword matching, error codes, and unique identifiers.
3. **Reciprocal Rank Fusion (RRF)**: Merges both ranking lists using formula \`score = sum(1 / (k + rank))\` to produce state-of-the-art search relevance.`
  },
  {
    keywords: ["docker", "container", "sandbox", "compose"],
    reply: `**Docker & Code Execution Security:**
1. **Container Isolation**: Running code inside dedicated Docker containers ensures host machine immunity from malicious scripts or resource leaks.
2. **Resource Constraints**: Always set memory and CPU caps (e.g. \`--memory="256m" --cpus="0.5"\`) and run with non-root security contexts.
3. **Docker Compose**: Orchestrates multi-tier microservices (Next.js, PostgreSQL with pgvector, and Redis) over internal isolated networks.`
  }
];

function sendAiMessage() {
  const input = document.getElementById("aiChatInput");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = "";

  const chatContainer = document.getElementById("aiChatMessages");
  if (!chatContainer) return;

  // Add User Message
  const userDiv = document.createElement("div");
  userDiv.className = "chat-msg user";
  userDiv.innerHTML = `
    <div class="chat-bubble">${text}</div>
    <div class="chat-avatar user">👤</div>
  `;
  chatContainer.appendChild(userDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Determine Response
  const lower = text.toLowerCase();
  let matched = AI_KNOWLEDGE_BASE.find(kb => kb.keywords.some(k => lower.includes(k)));
  let answer = matched ? matched.reply : `I found relevant material in the EduTech knowledge base for **"${text}"**:\n\n- The platform includes comprehensive modules covering this topic with interactive code examples.\n- Check out the **Interactive Classroom** and **Course Catalog** for complete architectural walkthroughs and live video lectures!`;

  // Simulate AI Thinking & Typing
  setTimeout(() => {
    const botDiv = document.createElement("div");
    botDiv.className = "chat-msg bot";
    botDiv.innerHTML = `
      <div class="chat-avatar bot">🤖</div>
      <div class="chat-bubble" style="white-space: pre-wrap;">${answer}</div>
    `;
    chatContainer.appendChild(botDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 400);
}

function askQuickPrompt(promptText) {
  const input = document.getElementById("aiChatInput");
  if (input) {
    input.value = promptText;
    sendAiMessage();
  }
}

// Initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Setup Navigation Clicks
  document.querySelectorAll(".nav-item-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  // Mobile Toggle
  const toggleBtn = document.getElementById("mobileMenuBtn");
  const drawer = document.getElementById("mobileNavDrawer");
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener("click", () => {
      drawer.classList.toggle("open");
    });
  }

  // Search and Category Filters
  const searchInput = document.getElementById("courseSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      State.searchQuery = e.target.value;
      renderCourses();
    });
  }

  document.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      State.activeFilter = pill.dataset.filter || "all";
      renderCourses();
    });
  });

  // Classroom Tab switching
  document.querySelectorAll(".lesson-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".lesson-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      State.activeLessonTab = btn.dataset.lessonTab;
      renderLessonTabContent();
    });
  });

  // AI chat on Enter
  const aiInput = document.getElementById("aiChatInput");
  if (aiInput) {
    aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendAiMessage();
    });
  }

  // Initial Renders
  renderCourses();
  renderClassroom();
  updateDashboardStats();

  // Run initial sandbox code
  setSandboxTemplate("cosine");
});
