import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("q");

    const whereClause: Record<string, unknown> = {
      isPublished: true,
    };

    if (category) {
      whereClause.category = { slug: category };
    }

    if (level) {
      whereClause.level = level;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
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
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = courses.map((course) => {
      const allLessons = course.modules.flatMap((m) => m.lessons);
      const totalDuration = allLessons.reduce((acc, l) => acc + l.durationMinutes, 0);
      const totalLessons = allLessons.length;
      const averageRating =
        course.reviews.length > 0
          ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
          : 5.0;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        subtitle: course.subtitle,
        description: course.description,
        level: course.level,
        price: Number(course.price),
        thumbnailUrl: course.thumbnailUrl,
        instructor: course.instructor,
        category: course.category,
        modulesCount: course.modules.length,
        lessonsCount: totalLessons,
        totalDurationMinutes: totalDuration,
        enrollmentsCount: course._count.enrollments,
        averageRating: Number(averageRating.toFixed(1)),
        reviewsCount: course.reviews.length,
        modules: course.modules,
      };
    });

    return NextResponse.json({ success: true, count: formatted.length, courses: formatted });
  } catch (error: unknown) {
    console.error("Courses API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses. Ensure PostgreSQL is running and seeded.",
        details: error instanceof Error ? error.message : "Unknown error",
        courses: [],
      },
      { status: 500 }
    );
  }
}
