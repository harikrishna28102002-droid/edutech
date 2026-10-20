import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseByIdOrSlug } from "@/lib/lms-service";
import LearningPlayer from "./LearningPlayer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseByIdOrSlug(slug);

  if (!course) {
    return { title: "Course Not Found | EduTech" };
  }

  return {
    title: `Classroom: ${course.title} | EduTech Academy`,
    description: `Interactive learning player and hands-on coding classroom for ${course.title}`,
  };
}

export default async function LearnPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lesson } = await searchParams;
  const course = await getCourseByIdOrSlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <LearningPlayer course={course} initialLessonId={lesson} />
  );
}
