import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AuthButton from "@/components/AuthButton";
import CollapsibleChapter from "@/components/CollapsibleChapter";
import { getCourseBySlug, COURSES, COURSES_CATALOG } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Course } from "@/lib/courses";

const STUDENT_AVATARS = [
  "/images/course-detail-student-1.jpg",
  "/images/course-detail-student-2.jpg",
  "/images/course-detail-student-3.jpg",
];

export async function generateStaticParams() {
  return [...COURSES, ...COURSES_CATALOG].map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) {
    const dbCourse = await prisma.course.findUnique({
      where: { id: slug },
      select: { title: true, description: true },
    });
    if (!dbCourse) return { title: "案例未找到" };
    return {
      title: `${dbCourse.title} | OpenRise`,
      description: dbCourse.description ?? undefined,
    };
  }
  return {
    title: `${course.title} | OpenRise`,
    description: course.desc,
  };
}

type CourseWithMeta = Course & { isUserCourse?: boolean };
type SyllabusLessonWithId = { title: string; duration: string; id?: string; type?: string };

async function getDbCourse(slug: string): Promise<CourseWithMeta | null> {
  const dbCourse = await prisma.course.findUnique({
    where: { id: slug },
    include: {
      user: { select: { name: true, avatarUrl: true, role: true, bio: true } },
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!dbCourse) return null;
  const syllabus: { title: string; lessonCount: number; lessons: SyllabusLessonWithId[] }[] =
    dbCourse.chapters.map((ch) => ({
      title: ch.title,
      lessonCount: ch.lessons.length,
      lessons: ch.lessons.map((l) => ({
        title: l.title,
        duration: "-",
        id: l.id,
        type: l.type ?? "video",
      })),
    }));
  const lessonCount = dbCourse.chapters.reduce((s, ch) => s + ch.lessons.length, 0);
  return {
    slug: dbCourse.id,
    title: dbCourse.title,
    desc: dbCourse.description ?? "",
    fullDesc: dbCourse.description ?? undefined,
    img: dbCourse.coverImageUrl ?? "/images/logo.jpg",
    alt: dbCourse.title,
    topic: "用户创作",
    lessons: lessonCount,
    syllabus,
    isUserCourse: true,
    instructor: dbCourse.user
      ? {
          name: dbCourse.user.name ?? "匿名",
          role: dbCourse.user.role ?? "",
          bio: dbCourse.user.bio ?? "",
          img: dbCourse.user.avatarUrl ?? "/images/logo.jpg",
        }
      : undefined,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let course: CourseWithMeta | undefined =
    (getCourseBySlug(slug) as CourseWithMeta | undefined) ?? (await getDbCourse(slug)) ?? undefined;
  if (!course) notFound();

  const session = await getServerSession(authOptions);
  const isOwner =
    course.isUserCourse &&
    session?.user?.id &&
    (await prisma.course.findFirst({ where: { id: course.slug, userId: session.user.id } })) != null;

  const firstLessonId =
    course.isUserCourse &&
    course.syllabus?.[0]?.lessons?.[0] &&
    "id" in course.syllabus[0].lessons[0]
      ? (course.syllabus[0].lessons[0] as SyllabusLessonWithId).id
      : undefined;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-sage/30 bg-[#FAFAFA]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-12">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary"
            >
              <div className="flex shrink-0 items-center justify-center rounded-xl border border-gray-200/90 shadow-sm">
                <Image
                  src="/images/logo.jpg"
                  alt="OpenRise"
                  width={42}
                  height={42}
                  className="rounded-lg"
                />
              </div>
              <h2 className="font-display text-xl font-bold leading-tight text-primary">
                OpenRise
              </h2>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/courses"
                className="text-sm font-medium text-slate-700 transition-colors hover:text-primary"
              >
                案例库
              </Link>
              <Link
                href="/community"
                className="text-sm font-medium text-slate-700 transition-colors hover:text-primary"
              >
                社区
              </Link>
              <Link
                href="/resources"
                className="text-sm font-medium text-slate-700 transition-colors hover:text-primary"
              >
                资源
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl flex-1 px-6 py-8 lg:px-12">
        {/* Breadcrumbs & Back */}
        <div className="mb-12 flex flex-col gap-4">
          <Link
            href="/courses"
            className="flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            返回案例库
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Link href="/" className="transition-colors hover:text-primary">
              首页
            </Link>
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
            <Link href="/courses" className="transition-colors hover:text-primary">
              案例库
            </Link>
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
            <span className="text-primary">{course.title}</span>
          </div>
        </div>

        {/* Hero - 使用主页面卡片图片保持一致性 */}
        <section className="mb-24 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-sage/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-sm">bolt</span> 新案例
            </div>
            <h1 className="font-display text-5xl font-black leading-[1.1] tracking-tight text-primary lg:text-7xl">
              {course.title}
            </h1>
            <p className="max-w-xl text-lg font-light leading-relaxed text-slate-700 lg:text-xl">
              {course.fullDesc ?? course.desc}
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row">
              {course.isUserCourse && firstLessonId ? (
                <Link
                  href={`/account/lessons/${firstLessonId}`}
                  className="rounded-xl bg-primary px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-primary/10 transition-all hover:bg-emerald-900"
                >
                  开始学习
                </Link>
              ) : isOwner ? (
                <Link
                  href={`/account/courses/${course.slug}`}
                  className="rounded-xl bg-primary px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-primary/10 transition-all hover:bg-emerald-900"
                >
                  进入学习
                </Link>
              ) : (
                <Link
                  href="/courses"
                  className="rounded-xl bg-primary px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-primary/10 transition-all hover:bg-emerald-900"
                >
                  浏览更多
                </Link>
              )}
              <Link
                href="/courses"
                className="rounded-xl border-2 border-primary/20 px-8 py-4 text-center text-lg font-bold text-primary transition-all hover:border-primary"
              >
                返回案例库
              </Link>
            </div>
            {course.lessons && (
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {STUDENT_AVATARS.map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt="学员"
                      width={40}
                      height={40}
                      className="size-10 rounded-full border-2 border-[#FAFAFA]"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">
                  已有 2,400+ 学员参与
                </span>
              </div>
            )}
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-accent-sage/40 blur-2xl transition-colors group-hover:bg-accent-sage/60" />
            <div className="relative aspect-video overflow-hidden rounded-[2rem] border-8 border-white bg-slate-200 shadow-2xl lg:aspect-square">
              <Image
                src={course.img}
                alt={course.alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mb-24 grid grid-cols-1 gap-16 lg:grid-cols-3">
          {/* Syllabus */}
          <div className="space-y-8 lg:col-span-2">
            {course.syllabus ? (
              <>
                <div className="flex items-center justify-between border-b border-accent-sage/40 pb-6">
                  <h2 className="font-display text-3xl font-bold text-primary">
                    案例大纲
                  </h2>
                  <span className="font-medium text-slate-400">
                    {course.lessons} 节{course.hours ? ` • ${course.hours}` : ""}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {course.syllabus.map((module, i) => (
                    <CollapsibleChapter
                      key={i}
                      index={i}
                      title={module.title}
                      lessonCount={module.lessonCount}
                      lessons={module.lessons}
                      defaultOpen={i === 0}
                      isUserCourse={!!course.isUserCourse}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-accent-sage/30 bg-white p-12 text-center shadow-sm">
                <h2 className="font-display mb-4 text-2xl font-bold text-primary">
                  案例大纲
                </h2>
                <p className="text-slate-500">
                  内容即将上线，敬请期待！
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {course.instructor && (
              <div className="rounded-[2rem] bg-primary p-8 text-white">
                <h2 className="font-display mb-8 text-2xl font-bold">
                  讲师介绍
                </h2>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full border-2 border-dashed border-accent-sage/40" />
                    <Image
                      src={course.instructor.img}
                      alt={course.instructor.name}
                      width={128}
                      height={128}
                      className="size-32 rounded-full border-4 border-white object-cover"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-display text-2xl font-bold">
                      {course.instructor.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium uppercase tracking-widest text-accent-sage">
                      {course.instructor.role}
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-accent-sage/80">
                    {course.instructor.bio}
                  </p>
                  <div className="mt-4 flex gap-4">
                    <a
                      href="#"
                      className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                    >
                      <span className="material-symbols-outlined text-lg">
                        share
                      </span>
                    </a>
                    <a
                      href="#"
                      className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                    >
                      <span className="material-symbols-outlined text-lg">
                        alternate_email
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-[2rem] border border-accent-sage/40 bg-accent-sage/20 p-8">
              <h4 className="font-display mb-4 text-xl font-bold text-primary">
                包含内容
              </h4>
              <ul className="space-y-4">
                {[
                  "永久访问权限",
                  "多端同步学习",
                  "完成证书",
                  "可下载资源",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <span className="material-symbols-outlined text-lg text-primary">
                      check_circle
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary pt-24 pb-12 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 space-y-6 md:col-span-1">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo.jpg"
                  alt="OpenRise"
                  width={42}
                  height={42}
                  className="shrink-0 rounded-lg"
                />
                <h2 className="font-display text-2xl font-bold">OpenRise</h2>
              </div>
              <p className="text-sm leading-relaxed text-accent-sage/60">
                用 AI 帮助普通人成长。零门槛学习，场景实战，从「会聊天」到「会应用」。
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="font-display text-lg font-bold">平台</h4>
              <ul className="space-y-3 text-sm text-accent-sage/60">
                <li>
                  <Link href="/#courses" className="transition-colors hover:text-white">
                    浏览案例
                  </Link>
                </li>
                <li>
                  <Link href="/#" className="transition-colors hover:text-white">
                    学习路径
                  </Link>
                </li>
                <li>
                  <Link href="/#" className="transition-colors hover:text-white">
                    定价
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-display text-lg font-bold">关于</h4>
              <ul className="space-y-3 text-sm text-accent-sage/60">
                <li>
                  <Link href="/#" className="transition-colors hover:text-white">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="/#" className="transition-colors hover:text-white">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs font-medium uppercase tracking-wider text-accent-sage/40 md:flex-row">
            <p>© 2024 OpenRise. 用 AI 帮助普通人成长。</p>
            <div className="flex gap-8">
              <Link href="/#" className="transition-colors hover:text-white">
                隐私政策
              </Link>
              <Link href="/#" className="transition-colors hover:text-white">
                服务条款
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
