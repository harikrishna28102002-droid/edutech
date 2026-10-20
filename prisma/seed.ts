import { PrismaClient, Role, CourseLevel, EnrollmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Edutech database seeding...");

  // 1. Clean existing records in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing database tables.");

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@edutech.io",
      name: "Dr. Evelyn Vance",
      role: Role.ADMIN,
      bio: "Chief Academic Officer and System Administrator at Edutech Academy.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    },
  });

  const instructorUser = await prisma.user.create({
    data: {
      email: "instructor@edutech.io",
      name: "Prof. Marcus Sterling",
      role: Role.INSTRUCTOR,
      bio: "Principal Distributed Systems Architect and instructor with 15+ years experience building cloud platforms.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@edutech.io",
      name: "Sarah Lin",
      role: Role.STUDENT,
      bio: "Software engineer and continuous learner focusing on modern cloud engineering and AI architectures.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    },
  });

  console.log("👤 Created sample users (Admin, Instructor, Student).");

  // 3. Create Categories
  const catWeb = await prisma.category.create({
    data: {
      name: "Full-Stack Web Development",
      slug: "web-development",
      description: "Modern web architecture, TypeScript, React, Next.js, and scalable APIs.",
      icon: "code",
    },
  });

  const catAI = await prisma.category.create({
    data: {
      name: "AI & Machine Learning",
      slug: "ai-machine-learning",
      description: "Deep learning, LLMs, retrieval augmented generation, and agentic workflows.",
      icon: "cpu",
    },
  });

  const catCloud = await prisma.category.create({
    data: {
      name: "Cloud & DevOps",
      slug: "cloud-devops",
      description: "Docker, Kubernetes, CI/CD pipelines, Terraform, and cloud infrastructure.",
      icon: "cloud",
    },
  });

  console.log("🏷️ Created Course Categories.");

  // 4. Create Course 1: Full-Stack Next.js & Distributed Systems
  const course1 = await prisma.course.create({
    data: {
      title: "Production Next.js 16 & Microservices Architecture",
      slug: "production-nextjs-microservices",
      subtitle: "Build enterprise-scale full-stack applications with Next.js, Docker, PostgreSQL, and Redis.",
      description:
        "Master the complete journey from local architectural design to containerized cloud production. Learn server components, caching primitives, database connection pooling, distributed background queues, and automated CI/CD deployment pipelines.",
      level: CourseLevel.ADVANCED,
      price: 89.99,
      isPublished: true,
      instructorId: instructorUser.id,
      categoryId: catWeb.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      modules: {
        create: [
          {
            title: "Module 1: Foundations & Architecture",
            description: "Understand server components, execution contexts, and data flow.",
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: "Architectural Overview & Containerized Workflows",
                  slug: "architectural-overview",
                  content: "Deep dive into multi-tier web application architecture, stateless containers, and persistent storage layers.",
                  videoUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
                  durationMinutes: 18,
                  orderIndex: 1,
                  isFreePreview: true,
                },
                {
                  title: "Next.js App Router Internals & Streaming SSR",
                  slug: "nextjs-app-router-internals",
                  content: "Demystifying Server Actions, Suspense boundaries, Partial Prerendering, and Edge routing.",
                  durationMinutes: 24,
                  orderIndex: 2,
                  isFreePreview: true,
                },
              ],
            },
          },
          {
            title: "Module 2: Database Layer & Prisma ORM",
            description: "Production database modeling, connection pooling, and migrations.",
            orderIndex: 2,
            lessons: {
              create: [
                {
                  title: "PostgreSQL Relational Schema Design & Indexing",
                  slug: "postgres-schema-design",
                  content: "Composite indexes, foreign key cascading strategies, and query performance tuning.",
                  durationMinutes: 30,
                  orderIndex: 1,
                  isFreePreview: false,
                },
                {
                  title: "Prisma Migrations & Zero-Downtime Deployments",
                  slug: "prisma-migrations-docker",
                  content: "Automating schema migrations inside containerized deployment pipelines.",
                  durationMinutes: 22,
                  orderIndex: 2,
                  isFreePreview: false,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      modules: {
        include: { lessons: true },
      },
    },
  });

  // 5. Create Course 2: Applied AI & LLM Systems
  const course2 = await prisma.course.create({
    data: {
      title: "Applied LLM Engineering & Agentic Systems",
      slug: "applied-llm-engineering",
      subtitle: "Build resilient AI agents, semantic retrieval pipelines, and vector databases from scratch.",
      description:
        "Go beyond basic prompt engineering. Build production-ready RAG architectures, evaluation harnesses, tool calling loops, and real-time streaming interfaces.",
      level: CourseLevel.INTERMEDIATE,
      price: 99.99,
      isPublished: true,
      instructorId: instructorUser.id,
      categoryId: catAI.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      modules: {
        create: [
          {
            title: "Module 1: Vector Embeddings & Hybrid Search",
            description: "Dense and sparse vector search with PostgreSQL pgvector.",
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: "Introduction to Vector Embeddings",
                  slug: "vector-embeddings-intro",
                  content: "Mathematical intuition and practical implementation of text embeddings.",
                  durationMinutes: 15,
                  orderIndex: 1,
                  isFreePreview: true,
                },
                {
                  title: "Implementing Hybrid Semantic Search with pgvector",
                  slug: "pgvector-search",
                  content: "Configuring HNSW and IVFFlat indexes in PostgreSQL with Prisma.",
                  durationMinutes: 28,
                  orderIndex: 2,
                  isFreePreview: false,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 6. Create Course 3: Docker & Cloud Infrastructure
  const course3 = await prisma.course.create({
    data: {
      title: "Docker & Container Mastery for Developers",
      slug: "docker-container-mastery",
      subtitle: "Zero to hero containerization, Docker Compose orchestration, multi-stage builds, and security.",
      description:
        "Learn everything needed to containerize frontend, backend, and database services cleanly with minimal image footprints and robust network isolation.",
      level: CourseLevel.BEGINNER,
      price: 49.99,
      isPublished: true,
      instructorId: adminUser.id,
      categoryId: catCloud.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80",
      modules: {
        create: [
          {
            title: "Module 1: Docker Fundamentals",
            description: "Images, layers, caching, and container lifecycles.",
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: "Containers vs Virtual Machines",
                  slug: "containers-vs-vms",
                  content: "Understand cgroups, namespaces, and kernel isolation.",
                  durationMinutes: 12,
                  orderIndex: 1,
                  isFreePreview: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("📚 Created 3 sample courses with modules & lessons.");

  // 7. Create Enrollment & Progress for student
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: studentUser.id,
      courseId: course1.id,
      status: EnrollmentStatus.ACTIVE,
      progressPercent: 50.0,
    },
  });

  const firstLesson = course1.modules[0]?.lessons[0];
  if (firstLesson) {
    await prisma.lessonProgress.create({
      data: {
        userId: studentUser.id,
        lessonId: firstLesson.id,
        isCompleted: true,
        completedAt: new Date(),
        lastPositionSeconds: 1080,
      },
    });
  }

  // 8. Create Reviews
  await prisma.review.create({
    data: {
      userId: studentUser.id,
      courseId: course1.id,
      rating: 5,
      comment:
        "One of the best production-grade architectures I have worked through. The Docker Compose and PostgreSQL setup is crystal clear and matches real enterprise standards!",
    },
  });

  console.log("⭐ Created sample enrollment, progress, and student review.");
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
