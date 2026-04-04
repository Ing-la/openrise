import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateCourseForm from "./CreateCourseForm";
import EditProfileForm from "./EditProfileForm";

export const metadata: Metadata = {
  title: "个人中心 | OpenRise",
  description: "管理你的 OpenRise 课程与内容",
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const courses = await prisma.course.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { chapters: true } },
      chapters: {
        include: { _count: { select: { lessons: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

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
            <span className="text-sm text-slate-600">
              {user?.name ?? session.user.email}
            </span>
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {/* 讲师信息 */}
        <section className="mb-12">
          <EditProfileForm user={user} />
        </section>

        {/* 课程列表 */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">我的课程</h1>
          <CreateCourseForm />
        </div>

        {courses.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white px-8 py-16 text-center">
            <span className="material-symbols-outlined mb-4 text-5xl text-slate-300">
              menu_book
            </span>
            <p className="mb-2 text-slate-600">还没有课程</p>
            <p className="mb-6 text-sm text-slate-500">
              创建课程后，可添加章节和小节（视频或 Markdown）
            </p>
            <CreateCourseForm variant="primary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/account/courses/${course.id}`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md overflow-hidden"
              >
                {course.coverImageUrl ? (
                  <div className="relative aspect-video overflow-hidden bg-slate-200">
                    <Image
                      src={course.coverImageUrl}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized={course.coverImageUrl?.indexOf('/uploads/') === 0}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-emerald-50 text-primary">
                    <span className="material-symbols-outlined text-5xl">
                      play_circle
                    </span>
                  </div>
                )}
                <div className="flex flex-col p-6">
                  <h3 className="mb-1 font-semibold text-slate-900 line-clamp-2">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                      {course.description}
                    </p>
                  )}
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      course.isPublic
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-800"
                    }`}>
                      {course.isPublic ? "公开" : "私有"}
                    </span>
                  </div>
                  <p className="mt-auto text-xs text-slate-400">
                    {course._count.chapters} 章 •{" "}
                    {course.chapters.reduce((s, ch) => s + ch._count.lessons, 0)}{" "}
                    节
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
