import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const openApiSpec = {
    openapi: "3.1.0",
    info: {
      title: "EduTech Enterprise LMS & AI Backend API",
      version: "1.0.0",
      description:
        "Comprehensive RESTful Backend API for EduTech LMS platform with Course Management, Curriculum & Lessons, Social Reviews, Student Progress Tracking, Hybrid Semantic RAG Search, Docker Code Sandboxing, and Fine-Tuning Pipelines.",
      contact: {
        name: "EduTech Engineering",
        email: "engineering@edutech.io",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
    tags: [
      { name: "Courses", description: "Course catalog, creation, update, and deletion" },
      { name: "Curriculum", description: "Modules and Lesson hierarchy management" },
      { name: "Learning", description: "Student course enrollments and lesson progress tracking" },
      { name: "Reviews", description: "Course reviews, feedback, and star ratings" },
      { name: "Categories", description: "Course taxonomy and categorizations" },
      { name: "Users & Auth", description: "User directory, profiles, and demo session management" },
      { name: "AI & Search", description: "Semantic hybrid search and retrieval-augmented generation" },
      { name: "Code Sandbox", description: "Secure Docker-isolated code runner" },
      { name: "Training & Eval", description: "Fine-tune dataset generation and model evaluation" },
      { name: "System", description: "Health monitoring and platform statistics" },
    ],
    paths: {
      "/api/courses": {
        get: {
          tags: ["Courses"],
          summary: "List all published courses with filtering",
          parameters: [
            { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category slug" },
            { name: "level", in: "query", schema: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] }, description: "Filter by course difficulty" },
            { name: "q", in: "query", schema: { type: "string" }, description: "Search query for title and description" },
            { name: "instructorId", in: "query", schema: { type: "string" }, description: "Filter by instructor ID" },
          ],
          responses: {
            "200": {
              description: "List of courses matching criteria",
              content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, count: { type: "integer" }, courses: { type: "array" } } } } },
            },
          },
        },
        post: {
          tags: ["Courses"],
          summary: "Create a new course",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "description", "categoryId"],
                  properties: {
                    title: { type: "string", example: "Microservices with Next.js 16" },
                    subtitle: { type: "string", example: "Build scalable cloud-native architectures" },
                    description: { type: "string", example: "Complete deep dive into distributed systems..." },
                    level: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" },
                    price: { type: "number", example: 49.99 },
                    categoryId: { type: "string", example: "cat_web" },
                    instructorId: { type: "string", example: "usr_instructor_1" },
                    thumbnailUrl: { type: "string", example: "https://images.unsplash.com/photo-1555066931-4365d14bab8c" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Course created successfully" },
            "400": { description: "Missing required fields" },
          },
        },
      },
      "/api/courses/{id}": {
        get: {
          tags: ["Courses"],
          summary: "Get course details by ID or slug with full curriculum",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Course ID or slug" }],
          responses: {
            "200": { description: "Course found" },
            "404": { description: "Course not found" },
          },
        },
        put: {
          tags: ["Courses"],
          summary: "Update course details",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    isPublished: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Course updated successfully" },
            "404": { description: "Course not found" },
          },
        },
        delete: {
          tags: ["Courses"],
          summary: "Delete a course",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Course deleted successfully" },
            "404": { description: "Course not found" },
          },
        },
      },
      "/api/courses/{id}/modules": {
        post: {
          tags: ["Curriculum"],
          summary: "Add a curriculum module to a course",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Course ID" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string", example: "Module 2: Advanced Caching & Invalidation" },
                    orderIndex: { type: "integer", example: 2 },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Module created successfully" },
            "404": { description: "Course not found" },
          },
        },
      },
      "/api/courses/{id}/reviews": {
        get: {
          tags: ["Reviews"],
          summary: "Get student reviews for a course",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Course ID" }],
          responses: {
            "200": { description: "List of reviews" },
          },
        },
        post: {
          tags: ["Reviews"],
          summary: "Submit a course review & star rating",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Course ID" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rating"],
                  properties: {
                    rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
                    comment: { type: "string", example: "Outstanding architectural explanations." },
                    userId: { type: "string", example: "usr_student_1" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Review created" },
            "400": { description: "Invalid rating" },
          },
        },
      },
      "/api/modules/{id}/lessons": {
        post: {
          tags: ["Curriculum"],
          summary: "Add a lesson to a module",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Module ID" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string", example: "Distributed Tracing with OpenTelemetry" },
                    description: { type: "string", example: "Trace requests across services" },
                    content: { type: "string", example: "# Distributed Tracing\n\nConfigure Jaeger and OpenTelemetry..." },
                    durationMinutes: { type: "integer", example: 25 },
                    isFreePreview: { type: "boolean", default: false },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Lesson created" },
            "404": { description: "Module not found" },
          },
        },
      },
      "/api/lessons/{id}": {
        get: {
          tags: ["Curriculum"],
          summary: "Get lesson details with module context and navigation",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Lesson ID or slug" }],
          responses: {
            "200": { description: "Lesson retrieved" },
            "404": { description: "Lesson not found" },
          },
        },
        put: {
          tags: ["Curriculum"],
          summary: "Update lesson details or content",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Lesson ID" }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    durationMinutes: { type: "integer" },
                    isFreePreview: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Lesson updated" },
            "404": { description: "Lesson not found" },
          },
        },
        delete: {
          tags: ["Curriculum"],
          summary: "Delete a lesson",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Lesson ID" }],
          responses: {
            "200": { description: "Lesson deleted" },
            "404": { description: "Lesson not found" },
          },
        },
      },
      "/api/enroll": {
        get: {
          tags: ["Learning"],
          summary: "Get current user course enrollments",
          parameters: [{ name: "userId", in: "query", schema: { type: "string" }, description: "User ID (defaults to demo student)" }],
          responses: {
            "200": { description: "Enrollments list" },
          },
        },
        post: {
          tags: ["Learning"],
          summary: "Enroll user in a course",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["courseId"],
                  properties: {
                    courseId: { type: "string", example: "crs_nextjs_microservices" },
                    userId: { type: "string", example: "usr_student_1" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Enrolled successfully" },
            "400": { description: "Missing courseId" },
          },
        },
      },
      "/api/progress": {
        get: {
          tags: ["Learning"],
          summary: "Get lesson progress records for a user",
          parameters: [
            { name: "userId", in: "query", schema: { type: "string" }, description: "User ID" },
            { name: "courseId", in: "query", schema: { type: "string" }, description: "Optional course filter" },
          ],
          responses: {
            "200": { description: "Progress list" },
          },
        },
        post: {
          tags: ["Learning"],
          summary: "Record lesson completion or video position (updates course % automatically)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["lessonId"],
                  properties: {
                    lessonId: { type: "string", example: "les_1" },
                    userId: { type: "string", example: "usr_student_1" },
                    isCompleted: { type: "boolean", default: true },
                    lastPositionSeconds: { type: "integer", example: 340 },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Progress recorded and course percentage recalculated" },
          },
        },
      },
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "List all course categories with counts",
          responses: {
            "200": { description: "Categories list" },
          },
        },
        post: {
          tags: ["Categories"],
          summary: "Create a new course category",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", example: "Cybersecurity & DevSecOps" },
                    description: { type: "string", example: "Vulnerability analysis, container scanning, and zero trust architecture." },
                    icon: { type: "string", example: "shield" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Category created" },
            "400": { description: "Category name required" },
          },
        },
      },
      "/api/users": {
        get: {
          tags: ["Users & Auth"],
          summary: "List users with optional role filtering",
          parameters: [{ name: "role", in: "query", schema: { type: "string", enum: ["STUDENT", "INSTRUCTOR", "ADMIN"] }, description: "Filter by role" }],
          responses: {
            "200": { description: "User directory" },
          },
        },
      },
      "/api/users/{id}": {
        get: {
          tags: ["Users & Auth"],
          summary: "Get user profile with created courses and enrollments",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "User profile" },
            "404": { description: "User not found" },
          },
        },
      },
      "/api/auth/session": {
        get: {
          tags: ["Users & Auth"],
          summary: "Get current session (supports role switching simulation)",
          parameters: [{ name: "role", in: "query", schema: { type: "string", enum: ["STUDENT", "INSTRUCTOR", "ADMIN"] } }],
          responses: {
            "200": { description: "Active session" },
          },
        },
        post: {
          tags: ["Users & Auth"],
          summary: "Switch demo session role",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    role: { type: "string", enum: ["STUDENT", "INSTRUCTOR", "ADMIN"], default: "STUDENT" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Session switched" },
          },
        },
      },
      "/api/answer": {
        post: {
          tags: ["AI & Search"],
          summary: "Execute RAG answer pipeline with hybrid search & Ollama LLM",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["question"],
                  properties: {
                    question: { type: "string", example: "How do I create path parameters with type hints in FastAPI?" },
                    model: { type: "string", default: "llama3.2:3b" },
                    topK: { type: "integer", default: 5 },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Synthesized answer with citations and code snippets" },
          },
        },
      },
      "/api/search": {
        get: {
          tags: ["AI & Search"],
          summary: "Hybrid search across documentation chunks",
          parameters: [
            { name: "q", in: "query", required: true, schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 8 } },
          ],
          responses: {
            "200": { description: "Ranked search results" },
          },
        },
      },
      "/api/sandbox": {
        post: {
          tags: ["Code Sandbox"],
          summary: "Execute Python code inside Docker container sandbox",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["code"],
                  properties: {
                    code: { type: "string", example: "print('Hello from EduTech Docker sandbox!')" },
                    timeout: { type: "integer", default: 10 },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Execution result with stdout, stderr, and exit code" },
          },
        },
      },
      "/api/health": {
        get: {
          tags: ["System"],
          summary: "Check backend and database health status",
          responses: {
            "200": { description: "Service is healthy" },
          },
        },
      },
      "/api/stats": {
        get: {
          tags: ["System"],
          summary: "Get database collection counts and platform metrics",
          responses: {
            "200": { description: "System metrics" },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
    },
  });
}
