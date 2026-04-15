import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AuthButton from "@/components/AuthButton";
import { CourseService } from "@/lib/services/course-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import VideoLesson from "@/app/account/lessons/[id]/VideoLesson";
import MarkdownLesson from "@/app/account/lessons/[id]/MarkdownLesson";
import PdfLesson from "@/app/account/lessons/[id]/PdfLesson";
import ImageLesson from "@/app/account/lessons/[id]/ImageLesson";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;

  // 获取会话以进行权限校验
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const lesson = await CourseService.getLessonDetail(id, userId);
  if (!lesson) return { title: "小节未找到" };

  // 验证课程slug匹配
  if (lesson.chapter.course.id !== slug) {
    return { title: "课程不匹配" };
  }

  return { title: `${lesson.title} | Zero One` };
}

export default async function PublicLessonPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  // 获取会话以进行权限校验
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // 获取小节详情（包含权限校验）
  const lesson = await CourseService.getLessonDetail(id, userId);
  if (!lesson) notFound();

  // 验证课程slug匹配，如果不匹配则重定向到正确路径
  if (lesson.chapter.course.id !== slug) {
    redirect(`/courses/${lesson.chapter.course.id}/lessons/${id}`);
  }

  const courseId = lesson.chapter.course.id;
  const courseTitle = lesson.chapter.course.title;
  const chapterTitle = lesson.chapter.title;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-4 md:px-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-xl border border-gray-200/90 shadow-sm">
              <Image
                src="/images/logo.jpg"
                alt="Zero One"
                width={42}
                height={42}
                className="rounded-lg"
              />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Zero One
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {/* 面包屑导航 */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/courses" className="hover:text-primary">
              内容库
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link href={`/courses/${courseId}`} className="hover:text-primary">
              {courseTitle}
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900">{chapterTitle}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
        </div>

        {lesson.type === "video" && lesson.videoUrl && (
          <VideoLesson url={lesson.videoUrl} platform={lesson.platform ?? "bilibili"} />
        )}

        {lesson.type === "markdown" && lesson.content && (
          <MarkdownLesson content={lesson.content} />
        )}

        {lesson.type === "pdf" && lesson.pdfUrl && (
          <PdfLesson pdfUrl={lesson.pdfUrl} />
        )}

        {lesson.type === "image" && lesson.imageUrls && lesson.imageUrls.length > 0 && (
          <ImageLesson imageUrls={lesson.imageUrls} />
        )}

        {/* 课程作者提示（如果是私有课程） */}
        {!lesson.chapter.course.isPublic && (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">lock</span>
              <span className="font-medium">私有课程</span>
            </div>
            <p className="mt-1">
              此课程为私有内容，仅对你可见。其他用户无法访问。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}