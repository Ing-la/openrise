import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditCourseForm from "./EditCourseForm";
import ChapterList from "./ChapterList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { title: "课程" };

  const { id } = await params;
  const course = await prisma.course.findFirst({
    where: { id, userId: session.user.id },
  });
  return {
    title: course ? `${course.title} | OpenRise` : "课程",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const course = await prisma.course.findFirst({
    where: { id, userId: session.user.id },
    include: {
      user: true,
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  if (!course) {
    notFound();
  }

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
          <Link
            href="/account"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
          >
            返回个人中心
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {/* 课程信息 + 编辑 */}
        <div className="mb-8">
          <EditCourseForm course={course} />
        </div>

        {/* 课程大纲：章节（可展开）+ 小节（点击跳转） */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">课程大纲</h2>
          <ChapterList
            courseId={course.id}
            chapters={course.chapters}
            user={course.user}
          />
        </div>
      </main>
    </div>
  );
}
