"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import AuthButton from "@/components/AuthButton";
import { ALL_COURSES } from "@/lib/courses";
import type { Course } from "@/lib/courses";

const TOPICS = [
  { id: "all", label: "全部案例", icon: "apps" },
  { id: "ai", label: "求职就业", icon: "work" },
  { id: "design", label: "论文调研", icon: "menu_book" },
  { id: "dev", label: "家庭教育", icon: "family_restroom" },
  { id: "automation", label: "工作效率", icon: "smart_toy" },
  { id: "user", label: "用户创作", icon: "person" },
];

export default function CoursesListPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [userCourses, setUserCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch("/api/courses/public")
      .then((res) => res.ok && res.json())
      .then((data) => setUserCourses(data ?? []))
      .catch(() => setUserCourses([]));
  }, []);

  const allCourses: Course[] = [...ALL_COURSES, ...userCourses];
  const currentTopic = TOPICS.find((t) => t.id === selectedTopic)!;
  const filteredCourses =
    selectedTopic === "all"
      ? allCourses
      : selectedTopic === "ai"
        ? ALL_COURSES.filter((c) => c.topic === "求职就业")
        : selectedTopic === "design"
          ? ALL_COURSES.filter((c) => c.topic === "论文调研")
          : selectedTopic === "dev"
            ? ALL_COURSES.filter((c) => c.topic === "家庭教育")
            : selectedTopic === "automation"
              ? ALL_COURSES.filter((c) => c.topic === "工作效率")
              : selectedTopic === "user"
                ? userCourses
                : allCourses;

  return (
    <div className="flex min-h-screen grow flex-col bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-emerald-100 bg-white px-6 py-4 lg:px-10">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <div className="flex shrink-0 items-center justify-center rounded-xl border border-gray-200/90 shadow-sm">
              <Image
                src="/images/logo.jpg"
                alt="OpenRise"
                width={42}
                height={42}
                className="rounded-lg"
              />
            </div>
            <h2 className="font-display text-xl font-bold leading-tight tracking-tight">
              OpenRise
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              首页
            </Link>
            <Link
              href="/courses"
              className="border-b-2 border-primary pb-1 text-sm font-semibold text-primary"
            >
              案例库
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              社区
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <label className="hidden lg:flex min-w-40 max-w-64 flex-col">
            <div className="flex h-10 w-full flex-1 items-stretch rounded-full border border-emerald-100 bg-emerald-50/30">
              <span className="flex items-center justify-center pl-4 text-slate-400">
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input
                className="form-input h-full min-w-0 flex-1 border-none bg-transparent px-4 pl-2 text-sm font-normal placeholder:text-slate-400 focus:ring-0"
                placeholder="搜索案例..."
              />
            </div>
          </label>
          <AuthButton variant="courses" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-12 md:flex-row lg:px-10">
        {/* Sidebar - Topics 可点击 */}
        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-28">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">
              场景分类
            </h3>
            <ul className="space-y-2">
              {TOPICS.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedTopic(t.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                      selectedTopic === t.id
                        ? "bg-emerald-50 font-semibold text-primary"
                        : "text-slate-600 hover:bg-emerald-50/50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {t.icon}
                    </span>
                    <span className="text-sm">{t.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content - 标题为当前 topic */}
        <section className="flex-1">
          <div className="mb-10">
            <h1 className="font-display mb-4 text-5xl tracking-tight text-slate-900">
              {currentTopic.label}
            </h1>
            <p className="max-w-2xl text-lg text-slate-500">
              零门槛学习，场景实战，成果可见。从真实场景中掌握 AI 应用能力。
            </p>
          </div>

          {/* Course Grid - 根据 topic 过滤 */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-4">
                  <div className="mb-5 aspect-video w-full overflow-hidden rounded-xl">
                    <Image
                      src={course.img}
                      alt={course.alt}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={course.img?.startsWith('/uploads/')}
                    />
                  </div>
                  {course.topic && (
                    <span className="mb-3 inline-block rounded-full bg-accent-sage px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                      {course.topic}
                    </span>
                  )}
                  <h3 className="font-display mb-2 text-xl text-slate-900">
                    {course.title}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-slate-500">
                    {course.desc}
                  </p>
                </div>
                <div className="mt-auto p-4 pt-0">
                  <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-emerald-800">
                    立即学习
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-emerald-100 bg-white py-12">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-10">
          <div className="flex items-center gap-2 text-primary">
            <Image
              src="/images/logo.jpg"
              alt="OpenRise"
              width={42}
              height={42}
              className="shrink-0 rounded-lg"
            />
            <h2 className="font-display text-lg font-bold leading-tight tracking-tight uppercase">
              OpenRise
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            © 2024 OpenRise. 用 AI 帮助普通人成长。
          </p>
          <div className="flex gap-6">
            <Link
              href="/#"
              className="text-slate-400 transition-colors hover:text-primary"
            >
              隐私政策
            </Link>
            <Link
              href="/#"
              className="text-slate-400 transition-colors hover:text-primary"
            >
              服务条款
            </Link>
            <Link
              href="/#"
              className="text-slate-400 transition-colors hover:text-primary"
            >
              联系我们
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
