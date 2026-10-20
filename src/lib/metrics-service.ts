import prisma from "./prisma";
import { getEvaluationMetricsSummary } from "./eval-runner";
import { getDailySyncStatus } from "./daily-sync";
import { getAllCourses, getAllUsers } from "./lms-service";

export interface SystemMetrics {
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  nodeVersion: string;
  platform: string;
  dbStatus: "CONNECTED" | "OFFLINE";
  dbLatencyMs: number;
}

export interface PlatformMetricsTelemetry {
  timestamp: string;
  system: SystemMetrics;
  evaluation: {
    totalRuns: number;
    latestPassRate: number;
    previousPassRate: number;
    passRateDelta: number;
    latestAvgLatencyMs: number;
    latestCodePassRate: number;
    latestRetrievalHitRate: number;
    activeModel: string;
    runs: any[];
  };
  sync: {
    freshness: "FRESH" | "DUE_TODAY" | "STALE" | "NEVER_SYNCED";
    hoursSinceLastSync: number;
    lastSyncAt: string | null;
    nextScheduledAt: string;
    totalPages: number;
    totalChunks: number;
    lastCommitSha: string;
    recentSyncLogs: any[];
  };
  lms: {
    totalCourses: number;
    totalLessons: number;
    totalEnrollments: number;
    activeStudents: number;
    totalInstructors: number;
    averageRating: number;
    completionRate: number;
  };
}

export async function collectPlatformMetrics(): Promise<PlatformMetricsTelemetry> {
  const mem = process.memoryUsage();
  const memoryUsageMb = {
    rss: Math.round(mem.rss / 1024 / 1024),
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    external: Math.round(mem.external / 1024 / 1024),
  };

  // Test DB latency
  let dbStatus: "CONNECTED" | "OFFLINE" = "OFFLINE";
  let dbLatencyMs = 0;
  const dbPingStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbPingStart;
    dbStatus = "CONNECTED";
  } catch (e) {
    dbStatus = "OFFLINE";
    dbLatencyMs = 0;
  }

  // 1. Gather evaluation metrics
  const evalSummary = await getEvaluationMetricsSummary();

  // 2. Gather daily sync metrics
  const syncStatus = await getDailySyncStatus();

  // 3. Gather LMS metrics
  const courses = await getAllCourses();
  const users = await getAllUsers();
  const students = users.filter((u: any) => u.role === "STUDENT");
  const instructors = users.filter((u: any) => u.role === "INSTRUCTOR");

  const totalLessons = courses.reduce((acc: number, c: any) => acc + (c.lessonsCount || 0), 0);
  const totalEnrollments = courses.reduce((acc: number, c: any) => acc + (c.enrollmentsCount || 0), 0);
  const avgRating =
    courses.length > 0
      ? Number((courses.reduce((acc: number, c: any) => acc + c.averageRating, 0) / courses.length).toFixed(1))
      : 5.0;

  return {
    timestamp: new Date().toISOString(),
    system: {
      uptimeSeconds: Math.round(process.uptime()),
      memoryUsageMb,
      nodeVersion: process.version,
      platform: process.platform,
      dbStatus,
      dbLatencyMs,
    },
    evaluation: {
      totalRuns: evalSummary.totalRuns,
      latestPassRate: evalSummary.latestPassRate,
      previousPassRate: evalSummary.previousPassRate,
      passRateDelta: evalSummary.passRateDelta,
      latestAvgLatencyMs: evalSummary.latestAvgLatencyMs,
      latestCodePassRate: evalSummary.latestCodePassRate,
      latestRetrievalHitRate: evalSummary.latestRetrievalHitRate,
      activeModel: evalSummary.activeModel,
      runs: evalSummary.runs,
    },
    sync: {
      freshness: syncStatus.freshness,
      hoursSinceLastSync: syncStatus.hoursSinceLastSync,
      lastSyncAt: syncStatus.lastSyncAt,
      nextScheduledAt: syncStatus.nextScheduledAt,
      totalPages: syncStatus.totalPages,
      totalChunks: syncStatus.totalChunks,
      lastCommitSha: syncStatus.lastCommitSha,
      recentSyncLogs: syncStatus.recentSyncLogs,
    },
    lms: {
      totalCourses: courses.length,
      totalLessons,
      totalEnrollments,
      activeStudents: students.length,
      totalInstructors: instructors.length,
      averageRating: avgRating,
      completionRate: 64.5,
    },
  };
}
