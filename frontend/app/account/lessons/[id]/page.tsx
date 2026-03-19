import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AuthButton from "@/components/AuthButton";
import { prisma } from "@/lib/prisma";
import VideoLesson from "./VideoLesson";
import MarkdownLesson from "./MarkdownLesson";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: { chapter: { include: { course: true } } },
  });
  if (!lesson) return { title: "小节" };
  return { title: `${lesson.title} | OpenRise` };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: {
      chapter: { include: { course: true } },
    },
  });

  if (!lesson) notFound();

  const courseId = lesson.chapter.courseId;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-4 md:px-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-xl border border-gray-200/90 shadow-sm">
              <Image
                src="/images/logo.jpg"
                alt="OpenRise"
                width={42}
                height={42}
                className="rounded-lg"
              />
            </div>
            <h2 className="text-xl font-bold uppercase leading-tight tracking-tight text-primary">
              OpenRise
            </h2>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/courses/${courseId}`}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
            >
              返回课程
            </Link>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold text-slate-900">{lesson.title}</h1>

        {lesson.type === "video" && lesson.videoUrl && (
          <VideoLesson url={lesson.videoUrl} platform={lesson.platform ?? "bilibili"} />
        )}

        {lesson.type === "markdown" && lesson.content && (
          <MarkdownLesson content={lesson.content} />
        )}
      </main>
    </div>
  );
}
