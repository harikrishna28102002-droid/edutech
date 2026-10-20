import type { Metadata } from "next";
import { getUserEnrollments, getUserProfile } from "@/lib/lms-service";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Learning Dashboard | EduTech Platform",
  description: "Track your enrolled courses, lesson completion, study streaks, and interactive coding progress.",
};

export default async function DashboardPage() {
  const [enrollments, profile] = await Promise.all([
    getUserEnrollments("usr_student_1"),
    getUserProfile("usr_student_1"),
  ]);

  const defaultUser = {
    id: "usr_student_1",
    name: "Sarah Lin",
    email: "student@edutech.io",
    role: "STUDENT",
    bio: "Software engineer and continuous learner focusing on modern cloud engineering and AI architectures.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
  };

  const user = profile || defaultUser;

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <DashboardClient
        initialEnrollments={enrollments as any}
        user={user as any}
      />
    </main>
  );
}
