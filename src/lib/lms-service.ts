import prisma from "./prisma";
import { CourseLevel, Role, EnrollmentStatus } from "@prisma/client";

export interface CourseFilter {
  category?: string;
  level?: string;
  search?: string;
  instructorId?: string;
}

// In-memory fallback dataset for offline/resilient local execution
const FALLBACK_USERS = [
  {
    id: "usr_admin_1",
    email: "admin@edutech.io",
    name: "Dr. Evelyn Vance",
    role: "ADMIN" as Role,
    bio: "Chief Academic Officer and System Administrator at Edutech Academy.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_instructor_1",
    email: "instructor@edutech.io",
    name: "Prof. Marcus Sterling",
    role: "INSTRUCTOR" as Role,
    bio: "Principal Distributed Systems Architect and instructor with 15+ years experience building cloud platforms.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_student_1",
    email: "student@edutech.io",
    name: "Sarah Lin",
    role: "STUDENT" as Role,
    bio: "Software engineer and continuous learner focusing on modern cloud engineering and AI architectures.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    createdAt: new Date().toISOString(),
  },
];

const FALLBACK_CATEGORIES = [
  {
    id: "cat_web",
    name: "Full-Stack Web Development",
    slug: "web-development",
    description: "Modern web architecture, TypeScript, React, Next.js, and scalable APIs.",
    icon: "code",
    coursesCount: 1,
  },
  {
    id: "cat_ai",
    name: "AI & Machine Learning",
    slug: "ai-machine-learning",
    description: "Deep learning, LLMs, retrieval augmented generation, and agentic workflows.",
    icon: "cpu",
    coursesCount: 1,
  },
  {
    id: "cat_cloud",
    name: "Cloud & DevOps",
    slug: "cloud-devops",
    description: "Docker, Kubernetes, CI/CD pipelines, Terraform, and cloud infrastructure.",
    icon: "cloud",
    coursesCount: 1,
  },
];

let IN_MEMORY_COURSES = [
  {
    id: "crs_nextjs_microservices",
    title: "Production Next.js 16 & Microservices Architecture",
    slug: "production-nextjs-microservices",
    subtitle: "Build enterprise-scale full-stack applications with Next.js, Docker, PostgreSQL, and Redis.",
    description: "Master the complete journey from local architectural design to containerized cloud production. Learn server components, caching primitives, database connection pooling, distributed background queues, and automated CI/CD deployment pipelines.",
    level: "ADVANCED" as CourseLevel,
    price: 89.99,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    instructorId: "usr_instructor_1",
    categoryId: "cat_web",
    instructor: FALLBACK_USERS[1],
    category: FALLBACK_CATEGORIES[0],
    modules: [
      {
        id: "mod_1",
        title: "Module 1: Foundations & Architecture",
        orderIndex: 1,
        lessons: [
          {
            id: "les_1",
            title: "Next.js 16 App Router Paradigm Shift",
            slug: "nextjs-16-app-router",
            description: "Understand React Server Components, server actions, and Turbopack.",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            content: "# Next.js 16 App Router\n\nUnderstand React Server Components and Turbopack runtime.",
            durationMinutes: 24,
            orderIndex: 1,
            isFreePreview: true,
          },
          {
            id: "les_2",
            title: "Zero-Downtime PostgreSQL with Prisma ORM",
            slug: "postgresql-prisma-docker",
            description: "Connection pooling, migration rollouts, and multi-tenant indexing.",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            content: "# Database Architecture\n\nConnection management with Prisma Client singletons.",
            durationMinutes: 38,
            orderIndex: 2,
            isFreePreview: false,
          },
        ],
      },
    ],
    reviews: [
      {
        id: "rev_1",
        rating: 5,
        comment: "Exceptional architecture walkthrough. The Docker multi-stage container optimization alone was worth it.",
        userId: "usr_student_1",
        user: { name: "Sarah Lin", avatarUrl: FALLBACK_USERS[2].avatarUrl },
        createdAt: new Date().toISOString(),
      },
    ],
    enrollmentsCount: 38,
    averageRating: 5.0,
    reviewsCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "crs_applied_llm",
    title: "Applied LLM Engineering & Agentic Systems",
    slug: "applied-llm-engineering",
    subtitle: "Build resilient AI agents, semantic retrieval pipelines, and vector databases from scratch.",
    description: "Hands-on guide to modern LLM engineering. Learn hybrid search with Reciprocal Rank Fusion (RRF), cross-score reranking, local Ollama streaming, and QLoRA fine-tuning on domain data.",
    level: "INTERMEDIATE" as CourseLevel,
    price: 99.99,
    isPublished: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    instructorId: "usr_instructor_1",
    categoryId: "cat_ai",
    instructor: FALLBACK_USERS[1],
    category: FALLBACK_CATEGORIES[1],
    modules: [
      {
        id: "mod_2",
        title: "Module 1: Retrieval Augmented Generation (RAG)",
        orderIndex: 1,
        lessons: [
          {
            id: "les_3",
            title: "Dense Vector Embeddings & BM25 Sparse Search",
            slug: "vector-embeddings-bm25",
            description: "Cosine similarity, sparse indexing, and Reciprocal Rank Fusion.",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            content: "# Hybrid Search\n\nCombining dense semantic vectors and sparse BM25 indices.",
            durationMinutes: 32,
            orderIndex: 1,
            isFreePreview: true,
          },
        ],
      },
    ],
    reviews: [],
    enrollmentsCount: 52,
    averageRating: 4.9,
    reviewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let IN_MEMORY_ENROLLMENTS: Array<{
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  completedAt?: string;
  createdAt: string;
}> = [
  {
    id: "enr_1",
    userId: "usr_student_1",
    courseId: "crs_nextjs_microservices",
    status: "ACTIVE" as EnrollmentStatus,
    progressPercent: 50.0,
    createdAt: new Date().toISOString(),
  },
];

let IN_MEMORY_PROGRESS: Array<{
  id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  lastPositionSeconds: number;
  updatedAt: string;
}> = [
  {
    id: "prg_1",
    userId: "usr_student_1",
    lessonId: "les_1",
    isCompleted: true,
    lastPositionSeconds: 1440,
    updatedAt: new Date().toISOString(),
  },
];

// Helper to format course object with computed statistics
function formatCourseStats(course: any) {
  const modules = course.modules || [];
  const allLessons = modules.flatMap((m: any) => m.lessons || []);
  const totalDuration = allLessons.reduce((acc: number, l: any) => acc + (l.durationMinutes || 0), 0);
  const reviews = course.reviews || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
      : 5.0;

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    subtitle: course.subtitle,
    description: course.description,
    level: course.level,
    price: Number(course.price),
    isPublished: course.isPublished,
    thumbnailUrl: course.thumbnailUrl,
    instructor: course.instructor,
    category: course.category,
    modulesCount: modules.length,
    lessonsCount: allLessons.length,
    totalDurationMinutes: totalDuration,
    enrollmentsCount: course.enrollmentsCount || course._count?.enrollments || 0,
    averageRating: Number(averageRating.toFixed(1)),
    reviewsCount: reviews.length,
    modules,
    reviews,
  };
}

// -------------------------------------------------------------
// Course Service Functions
// -------------------------------------------------------------

export async function getAllCourses(filters: CourseFilter = {}) {
  try {
    const whereClause: any = { isPublished: true };
    if (filters.category) whereClause.category = { slug: filters.category };
    if (filters.level) whereClause.level = filters.level;
    if (filters.instructorId) whereClause.instructorId = filters.instructorId;
    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const dbCourses = await prisma.course.findMany({
      where: whereClause,
      include: {
        instructor: { select: { id: true, name: true, avatarUrl: true, bio: true } },
        category: true,
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
              select: {
                id: true,
                title: true,
                slug: true,
                durationMinutes: true,
                isFreePreview: true,
              },
            },
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            user: { select: { name: true, avatarUrl: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbCourses.length > 0) {
      return dbCourses.map(formatCourseStats);
    }
  } catch (err) {
    // Database offline, use in-memory courses
  }

  // Filter in-memory fallback
  let list = IN_MEMORY_COURSES;
  if (filters.category) {
    list = list.filter((c) => c.category.slug === filters.category);
  }
  if (filters.level) {
    list = list.filter((c) => c.level === filters.level);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }
  return list.map(formatCourseStats);
}

export async function getCourseByIdOrSlug(idOrSlug: string) {
  try {
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        instructor: { select: { id: true, name: true, avatarUrl: true, bio: true } },
        category: true,
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (course) return formatCourseStats(course);
  } catch (err) {
    // Fall through to in-memory
  }

  const memCourse = IN_MEMORY_COURSES.find(
    (c) => c.id === idOrSlug || c.slug === idOrSlug
  );
  return memCourse ? formatCourseStats(memCourse) : null;
}

export async function createCourse(data: {
  title: string;
  subtitle?: string;
  description: string;
  level?: CourseLevel;
  price?: number;
  categoryId: string;
  instructorId: string;
  thumbnailUrl?: string;
}) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const created = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        subtitle: data.subtitle,
        description: data.description,
        level: data.level || CourseLevel.BEGINNER,
        price: data.price || 0.0,
        categoryId: data.categoryId,
        instructorId: data.instructorId,
        thumbnailUrl:
          data.thumbnailUrl ||
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
        isPublished: true,
      },
      include: {
        instructor: true,
        category: true,
        modules: true,
      },
    });
    return formatCourseStats(created);
  } catch (err) {
    // In-memory fallback
    const newCourse: any = {
      id: `crs_${Date.now()}`,
      title: data.title,
      slug,
      subtitle: data.subtitle || "",
      description: data.description,
      level: data.level || "BEGINNER",
      price: data.price || 0.0,
      isPublished: true,
      thumbnailUrl: data.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      instructorId: data.instructorId,
      categoryId: data.categoryId,
      instructor: FALLBACK_USERS[1],
      category: FALLBACK_CATEGORIES[0],
      modules: [],
      reviews: [],
      enrollmentsCount: 0,
      averageRating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    IN_MEMORY_COURSES.unshift(newCourse);
    return formatCourseStats(newCourse);
  }
}

export async function updateCourse(id: string, data: Partial<{
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  price: number;
  isPublished: boolean;
  thumbnailUrl: string;
}>) {
  try {
    const updated = await prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: true,
        category: true,
        modules: { include: { lessons: true } },
      },
    });
    return formatCourseStats(updated);
  } catch (err) {
    const idx = IN_MEMORY_COURSES.findIndex((c) => c.id === id);
    if (idx !== -1) {
      IN_MEMORY_COURSES[idx] = { ...IN_MEMORY_COURSES[idx], ...data } as any;
      return formatCourseStats(IN_MEMORY_COURSES[idx]);
    }
    return null;
  }
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.delete({ where: { id } });
    return true;
  } catch (err) {
    const initialLen = IN_MEMORY_COURSES.length;
    IN_MEMORY_COURSES = IN_MEMORY_COURSES.filter((c) => c.id !== id);
    return IN_MEMORY_COURSES.length < initialLen;
  }
}

// -------------------------------------------------------------
// Module & Lesson Services
// -------------------------------------------------------------

export async function createModule(courseId: string, data: { title: string; orderIndex?: number }) {
  try {
    const count = await prisma.module.count({ where: { courseId } });
    return await prisma.module.create({
      data: {
        courseId,
        title: data.title,
        orderIndex: data.orderIndex ?? count + 1,
      },
      include: { lessons: true },
    });
  } catch (err) {
    const course = IN_MEMORY_COURSES.find((c) => c.id === courseId);
    if (course) {
      const newMod = {
        id: `mod_${Date.now()}`,
        title: data.title,
        orderIndex: data.orderIndex || (course.modules.length + 1),
        lessons: [],
      };
      course.modules.push(newMod);
      return newMod;
    }
    return null;
  }
}

export async function createLesson(moduleId: string, data: {
  title: string;
  description?: string;
  videoUrl?: string;
  content: string;
  durationMinutes?: number;
  isFreePreview?: boolean;
}) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const count = await prisma.lesson.count({ where: { moduleId } });
    return await prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        slug,
        videoUrl: data.videoUrl,
        content: data.content,
        durationMinutes: data.durationMinutes || 15,
        isFreePreview: Boolean(data.isFreePreview),
        orderIndex: count + 1,
      },
    });
  } catch (err) {
    for (const c of IN_MEMORY_COURSES) {
      const mod = c.modules.find((m: any) => m.id === moduleId);
      if (mod) {
        const newLes = {
          id: `les_${Date.now()}`,
          title: data.title,
          slug,
          description: data.description || "",
          videoUrl: data.videoUrl || "",
          content: data.content,
          durationMinutes: data.durationMinutes || 15,
          orderIndex: (mod.lessons?.length || 0) + 1,
          isFreePreview: Boolean(data.isFreePreview),
        };
        mod.lessons.push(newLes);
        return newLes;
      }
    }
    return null;
  }
}

export async function getLessonById(idOrSlug: string) {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true, slug: true },
            },
            lessons: {
              orderBy: { orderIndex: "asc" },
              select: { id: true, title: true, slug: true, durationMinutes: true, orderIndex: true },
            },
          },
        },
      },
    });

    if (lesson) {
      const siblingLessons = lesson.module.lessons;
      const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
      const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;

      return {
        ...lesson,
        prevLesson,
        nextLesson,
      };
    }
  } catch (err) {
    // In-memory fallback
  }

  for (const c of IN_MEMORY_COURSES) {
    for (const m of c.modules) {
      const idx = m.lessons.findIndex((l: any) => l.id === idOrSlug || l.slug === idOrSlug);
      if (idx !== -1) {
        const les = m.lessons[idx];
        return {
          ...les,
          module: {
            id: m.id,
            title: m.title,
            course: { id: c.id, title: c.title, slug: c.slug },
            lessons: m.lessons,
          },
          prevLesson: idx > 0 ? m.lessons[idx - 1] : null,
          nextLesson: idx < m.lessons.length - 1 ? m.lessons[idx + 1] : null,
        };
      }
    }
  }
  return null;
}

// -------------------------------------------------------------
// Enrollment & Progress Services
// -------------------------------------------------------------

export async function enrollUserInCourse(userId: string, courseId: string) {
  try {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    return await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
        progressPercent: 0.0,
      },
      include: { course: true },
    });
  } catch (err) {
    const existing = IN_MEMORY_ENROLLMENTS.find(
      (e) => e.userId === userId && e.courseId === courseId
    );
    if (existing) return existing;

    const newEnr = {
      id: `enr_${Date.now()}`,
      userId,
      courseId,
      status: "ACTIVE" as EnrollmentStatus,
      progressPercent: 0.0,
      createdAt: new Date().toISOString(),
    };
    IN_MEMORY_ENROLLMENTS.push(newEnr);
    return newEnr;
  }
}

export async function getUserEnrollments(userId: string) {
  try {
    return await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true, avatarUrl: true } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    const enrs = IN_MEMORY_ENROLLMENTS.filter((e) => e.userId === userId);
    return enrs.map((e) => {
      const course = IN_MEMORY_COURSES.find((c) => c.id === e.courseId);
      return {
        ...e,
        course,
      };
    });
  }
}

export async function recordLessonProgress(data: {
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  lastPositionSeconds?: number;
}) {
  try {
    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: data.userId, lessonId: data.lessonId } },
      create: {
        userId: data.userId,
        lessonId: data.lessonId,
        isCompleted: data.isCompleted,
        lastPositionSeconds: data.lastPositionSeconds || 0,
        completedAt: data.isCompleted ? new Date() : null,
      },
      update: {
        isCompleted: data.isCompleted,
        lastPositionSeconds: data.lastPositionSeconds || 0,
        completedAt: data.isCompleted ? new Date() : null,
      },
      include: {
        lesson: {
          include: {
            module: { select: { courseId: true } },
          },
        },
      },
    });

    // Automatically recalculate course completion percentage
    const courseId = progress.lesson.module.courseId;
    const totalLessonsInCourse = await prisma.lesson.count({
      where: { module: { courseId } },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: data.userId,
        isCompleted: true,
        lesson: { module: { courseId } },
      },
    });

    const newProgressPercent =
      totalLessonsInCourse > 0
        ? Number(((completedLessons / totalLessonsInCourse) * 100).toFixed(1))
        : 0;

    await prisma.enrollment.updateMany({
      where: { userId: data.userId, courseId },
      data: {
        progressPercent: newProgressPercent,
        status: newProgressPercent >= 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
        completedAt: newProgressPercent >= 100 ? new Date() : null,
      },
    });

    return {
      progress,
      courseProgressPercent: newProgressPercent,
    };
  } catch (err) {
    // In-memory progress tracking
    const existingIdx = IN_MEMORY_PROGRESS.findIndex(
      (p) => p.userId === data.userId && p.lessonId === data.lessonId
    );
    const updatedPrg = {
      id: existingIdx !== -1 ? IN_MEMORY_PROGRESS[existingIdx].id : `prg_${Date.now()}`,
      userId: data.userId,
      lessonId: data.lessonId,
      isCompleted: data.isCompleted,
      lastPositionSeconds: data.lastPositionSeconds || 0,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      IN_MEMORY_PROGRESS[existingIdx] = updatedPrg;
    } else {
      IN_MEMORY_PROGRESS.push(updatedPrg);
    }

    return {
      progress: updatedPrg,
      courseProgressPercent: 100.0,
    };
  }
}

// -------------------------------------------------------------
// Categories & Reviews
// -------------------------------------------------------------

export async function getAllCategories() {
  try {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: "asc" },
    });
    if (cats.length > 0) {
      return cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        coursesCount: c._count.courses,
      }));
    }
  } catch (err) {
    // Fall through
  }
  return FALLBACK_CATEGORIES;
}

export async function addCourseReview(data: {
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
}) {
  try {
    return await prisma.review.upsert({
      where: { userId_courseId: { userId: data.userId, courseId: data.courseId } },
      create: {
        userId: data.userId,
        courseId: data.courseId,
        rating: Math.max(1, Math.min(5, data.rating)),
        comment: data.comment,
      },
      update: {
        rating: Math.max(1, Math.min(5, data.rating)),
        comment: data.comment,
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    });
  } catch (err) {
    const course = IN_MEMORY_COURSES.find((c) => c.id === data.courseId);
    const user = FALLBACK_USERS.find((u) => u.id === data.userId) || FALLBACK_USERS[2];
    const newRev = {
      id: `rev_${Date.now()}`,
      rating: data.rating,
      comment: data.comment || "",
      userId: data.userId,
      user: { name: user.name, avatarUrl: user.avatarUrl },
      createdAt: new Date().toISOString(),
    };
    if (course) {
      course.reviews.unshift(newRev as any);
    }
    return newRev;
  }
}

// -------------------------------------------------------------
// User Directory & Auth Sessions
// -------------------------------------------------------------

export async function getAllUsers(role?: Role) {
  try {
    return await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: { select: { coursesCreated: true, enrollments: true } },
      },
    });
  } catch (err) {
    let list = FALLBACK_USERS;
    if (role) list = list.filter((u) => u.role === role);
    return list;
  }
}

export async function getUserProfile(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        coursesCreated: { select: { id: true, title: true, slug: true, price: true } },
        enrollments: { include: { course: true } },
      },
    });
  } catch (err) {
    const u = FALLBACK_USERS.find((user) => user.id === id);
    if (u) {
      return {
        ...u,
        courses: [],
        enrollments: IN_MEMORY_ENROLLMENTS.filter((e) => e.userId === id),
      };
    }
    return null;
  }
}

export async function getDemoSession(role: "STUDENT" | "INSTRUCTOR" | "ADMIN" = "STUDENT") {
  const user = FALLBACK_USERS.find((u) => u.role === role) || FALLBACK_USERS[2];
  return {
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    token: `demo_jwt_token_${user.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
  };
}

export async function getCourseReviews(courseId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    if (reviews.length > 0) return reviews;
  } catch (err) {
    // Database offline
  }
  const course = IN_MEMORY_COURSES.find((c) => c.id === courseId);
  return course ? course.reviews : [];
}

export async function updateLesson(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    content: string;
    videoUrl: string;
    durationMinutes: number;
    isFreePreview: boolean;
    orderIndex: number;
  }>
) {
  try {
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.content !== undefined) updatePayload.content = data.content;
    if (data.videoUrl !== undefined) updatePayload.videoUrl = data.videoUrl;
    if (data.durationMinutes !== undefined) updatePayload.durationMinutes = data.durationMinutes;
    if (data.isFreePreview !== undefined) updatePayload.isFreePreview = data.isFreePreview;
    if (data.orderIndex !== undefined) updatePayload.orderIndex = data.orderIndex;

    return await prisma.lesson.update({
      where: { id },
      data: updatePayload,
    });
  } catch (err) {
    for (const c of IN_MEMORY_COURSES) {
      for (const m of c.modules) {
        const les = m.lessons.find((l: any) => l.id === id);
        if (les) {
          Object.assign(les, data);
          return les;
        }
      }
    }
    return null;
  }
}

export async function deleteLesson(id: string) {
  try {
    await prisma.lesson.delete({ where: { id } });
    return true;
  } catch (err) {
    for (const c of IN_MEMORY_COURSES) {
      for (const m of c.modules) {
        const idx = m.lessons.findIndex((l: any) => l.id === id);
        if (idx !== -1) {
          m.lessons.splice(idx, 1);
          return true;
        }
      }
    }
    return false;
  }
}

export async function deleteModule(id: string) {
  try {
    await prisma.module.delete({ where: { id } });
    return true;
  } catch (err) {
    for (const c of IN_MEMORY_COURSES) {
      const idx = c.modules.findIndex((m: any) => m.id === id);
      if (idx !== -1) {
        c.modules.splice(idx, 1);
        return true;
      }
    }
    return false;
  }
}

export async function createCategory(data: { name: string; description?: string; icon?: string }) {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    return await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon || "folder",
      },
    });
  } catch (err) {
    const newCat = {
      id: `cat_${Date.now()}`,
      name: data.name,
      slug,
      description: data.description || "",
      icon: data.icon || "folder",
      coursesCount: 0,
    };
    FALLBACK_CATEGORIES.push(newCat);
    return newCat;
  }
}

export async function getUserProgress(userId: string, courseId?: string) {
  try {
    const whereClause: any = { userId };
    if (courseId) {
      whereClause.lesson = { module: { courseId } };
    }
    return await prisma.lessonProgress.findMany({
      where: whereClause,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationMinutes: true,
            moduleId: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (err) {
    return IN_MEMORY_PROGRESS.filter((p) => p.userId === userId);
  }
}

