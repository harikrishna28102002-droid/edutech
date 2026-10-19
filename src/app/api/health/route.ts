import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let counts = { users: 0, courses: 0, lessons: 0, enrollments: 0 };
  let latencyMs = 0;
  let dbError = null;

  try {
    // Attempt database query with 3s timeout
    const testQuery = await Promise.race([
      prisma.$queryRaw`SELECT 1 as connected`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timed out")), 3000)
      ),
    ]);

    if (testQuery) {
      dbStatus = "connected";
      latencyMs = Date.now() - startTime;

      const [users, courses, lessons, enrollments] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.course.count().catch(() => 0),
        prisma.lesson.count().catch(() => 0),
        prisma.enrollment.count().catch(() => 0),
      ]);

      counts = { users, courses, lessons, enrollments };
    }
  } catch (err: unknown) {
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : "Failed to connect to database";
    latencyMs = Date.now() - startTime;
  }

  const responseStatus = dbStatus === "connected" ? 200 : 503;

  return NextResponse.json(
    {
      status: dbStatus === "connected" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: {
        provider: "PostgreSQL",
        status: dbStatus,
        latencyMs,
        error: dbError,
        counts,
      },
      docker: {
        services: ["app (Next.js 16)", "db (Postgres 16 Alpine)", "db-setup (Tools)"],
        network: "edutech-network",
      },
    },
    { status: responseStatus }
  );
}
