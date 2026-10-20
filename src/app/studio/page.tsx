import type { Metadata } from "next";
import { getAllCourses, getAllCategories } from "@/lib/lms-service";
import StudioClient from "./StudioClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Faculty & Course Studio | EduTech Platform",
  description: "Visual course authoring and curriculum management studio for instructors.",
};

export default async function StudioPage() {
  const [courses, categories] = await Promise.all([
    getAllCourses(),
    getAllCategories(),
  ]);

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <StudioClient
        initialCourses={courses as any}
        categories={categories as any}
      />
    </main>
  );
}
