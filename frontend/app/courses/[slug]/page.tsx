import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { CourseService } from "@/lib/services/course-service";
import { authOptions } from "@/lib/auth";
import Logo from "@/components/Logo";
import AuthButton from "@/components/AuthButton";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const course = await CourseService.getCourseDetail(slug, userId);

    if (!course) {
      return {
        title: "课程不存在 | 零壹",
        description: "请求的课程不存在或无权访问",
      };
    }

    return {
      title: `${course.title} | 零壹`,
      description: course.description || "零壹 课程",
    };
  } catch (error) {
    console.error('Failed to generate metadata for course:', error);
    return {
      title: "课程 | 零壹",
      description: "零壹 课程",
    };
  }
}

export default async function CourseDetailPage({ params }: Props) {
  try {
    const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const course = await CourseService.getCourseDetail(slug, userId);

  // 控制显示开关（与首页保持一致）
  const showPricing = false;

  if (!course) {
    notFound();
  }

  const isOwner = userId && course.instructor?.name === "零壹官方" ? false : userId ? await CourseService.isCourseOwner(slug, userId) : false;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo size={42} variant="header" />
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
              零壹
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
        {/* Course header */}
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-200 md:w-96 md:shrink-0">
            {course.coverImageUrl ? (
              <Image
                src={course.coverImageUrl}
                alt={course.title}
                fill
                className="object-cover"
                unoptimized={course.coverImageUrl?.indexOf('/uploads/') === 0}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-5xl text-slate-400">
                <span className="material-symbols-outlined">play_circle</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                course.isPublic
                  ? "bg-green-100 text-green-800"
                  : "bg-slate-100 text-slate-800"
              }`}>
                {course.isPublic ? "公开课程" : "私有课程"}
              </span>
              {isOwner && (
                <Link
                  href={`/account/courses/${course.id}`}
                  className="rounded-lg border border-primary px-4 py-1 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  管理课程
                </Link>
              )}
            </div>
            {course.description && (
              <p className="mb-6 text-lg text-slate-600">{course.description}</p>
            )}
            <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-3">
                {course.instructor?.avatarUrl && (
                  <div className="relative size-10 overflow-hidden rounded-full border border-slate-200">
                    <Image
                      src={course.instructor.avatarUrl}
                      alt={course.instructor.name}
                      fill
                      className="object-cover"
                      unoptimized={course.instructor.avatarUrl?.indexOf('/uploads/') === 0}
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-700">{course.instructor?.name || "匿名讲师"}</p>
                  {course.instructor?.role && (
                    <p className="text-xs text-slate-500">{course.instructor.role}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">schedule</span>
                <span>共 {course.lessonCount} 节</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">calendar_today</span>
                <span>更新于 {new Date(course.updatedAt).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
            {course.syllabus.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-slate-900">课程大纲</h2>
                <div className="grid gap-4">
                  {course.syllabus.map((module, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">
                          第{idx + 1}章: {module.title}
                        </h3>
                        <span className="text-sm text-slate-500">{module.lessonCount} 节</span>
                      </div>
                      <div className="grid gap-3">
                        {module.lessons.map((lesson, lessonIdx) => {
                          // 类型配置映射
                          const typeConfig = {
                            video: { icon: 'play_circle', label: '视频' },
                            markdown: { icon: 'description', label: '文档' },
                            pdf: { icon: 'picture_as_pdf', label: '文档' },
                            image: { icon: 'photo_library', label: '图片' }
                          } as const;
                          const config = typeConfig[lesson.type as keyof typeof typeConfig] || typeConfig.markdown;
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
                            >
                              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                {lessonIdx + 1}
                              </span>
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-800">{lesson.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span className="material-symbols-outlined text-sm">{config.icon}</span>
                                  <span>{config.label}</span>
                                  {lesson.duration && <span>· {lesson.duration}</span>}
                                </div>
                              </div>
                              <Link
                                href={`/courses/${course.slug}/lessons/${lesson.id}`}
                                className="rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/5"
                              >
                                学习
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              {course.syllabus.length > 0 && (
                <Link
                  href={`/courses/${course.slug}/lessons/${course.syllabus[0]?.lessons[0]?.id}`}
                  className="rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-primary/90"
                >
                  开始学习
                </Link>
              )}
              <Link
                href="/courses"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 hover:bg-slate-50"
              >
                返回内容库
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
  } catch (error) {
    console.error('Failed to load course:', error);
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Logo size={42} variant="header" />
              <Link href="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
                零壹
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
            <p className="mb-2 text-slate-600">加载课程失败</p>
            <p className="text-sm text-slate-500">请稍后再试或联系管理员</p>
            <Link href="/courses" className="mt-6 inline-block rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
              返回内容库
            </Link>
          </div>
        </main>
      </div>
    );
  }
}
