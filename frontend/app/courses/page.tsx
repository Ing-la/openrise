import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CourseService } from "@/lib/services/course-service";
import Logo from "@/components/Logo";
import AuthButton from "@/components/AuthButton";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "内容库 | Zero One",
  description: "Zero One 精选 AI 实战内容，零门槛学习，场景实战，成果可见。",
};

export default async function CoursesPage() {
  try {
    const publicCourses = await CourseService.getPublicCourses();

    // 控制显示开关（与首页保持一致）
    const showPricing = false;

    return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo size={42} variant="header" />
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
              Zero One
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/community"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-primary"
            >
              社区
            </Link>
            <Link
              href="/courses"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-primary"
            >
              内容库
            </Link>
            {showPricing && (
              <Link
                href="/pricing"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-primary"
              >
                定价
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Page header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">内容库</h1>
          <p className="text-lg text-slate-600">
            零门槛学习，场景实战，成果可见。从真实场景中掌握 AI 应用能力。
          </p>
        </div>

        {/* Course grid */}
        {publicCourses.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-8 py-16 text-center">
            <span className="material-symbols-outlined mb-4 text-5xl text-slate-300">
              menu_book
            </span>
            <p className="mb-2 text-slate-600">暂无公开课程</p>
            <p className="text-sm text-slate-500">公开课程将会在这里展示</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {publicCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group block rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition-all hover:border-primary/30"
              >
                <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-slate-200">
                  {course.coverImageUrl ? (
                    <Image
                      src={course.coverImageUrl}
                      alt={course.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={course.coverImageUrl?.indexOf('/uploads/') === 0}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-5xl text-slate-400">
                      <span className="material-symbols-outlined">play_circle</span>
                    </div>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-700">
                  {course.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-500">
                  {course.description || "暂无描述"}
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">
                      schedule
                    </span>
                    共 {course.lessonCount} 节
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">
                      person
                    </span>
                    {course.instructor?.name || "匿名讲师"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
  } catch (error) {
    console.error('Failed to load courses:', error);
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Logo size={42} variant="header" />
              <Link href="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
                Zero One
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <AuthButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-8 py-16 text-center">
            <span className="material-symbols-outlined mb-4 text-5xl text-slate-300">
              error
            </span>
            <p className="mb-2 text-slate-600">加载课程列表失败</p>
            <p className="text-sm text-slate-500">请稍后再试或联系管理员</p>
          </div>
        </main>
      </div>
    );
  }
}
