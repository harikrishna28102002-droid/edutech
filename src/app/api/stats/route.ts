import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [coursesCount, usersCount, lessonsCount, enrollmentsCount, categoriesCount] =
      await Promise.all([
        prisma.course.count(),
        prisma.user.count(),
        prisma.lesson.count(),
        prisma.enrollment.count(),
        prisma.category.count(),
      ]);

    const instructorsCount = await prisma.user.count({
      where: { role: "INSTRUCTOR" },
    });

    const studentsCount = await prisma.user.count({
      where: { role: "STUDENT" },
    });

    return NextResponse.json({
      success: true,
      stats: {
        courses: coursesCount,
        users: usersCount,
        instructors: instructorsCount,
        students: studentsCount,
        lessons: lessonsCount,
        enrollments: enrollmentsCount,
        categories: categoriesCount,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Database not reachable. Make sure Docker PostgreSQL container is running.",
        stats: {
          courses: 0,
          users: 0,
          instructors: 0,
          students: 0,
          lessons: 0,
          enrollments: 0,
          categories: 0,
        },
      },
      { status: 500 }
    );
  }
}
