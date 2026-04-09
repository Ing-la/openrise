import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import { CourseService } from "@/lib/services/course-service";
import type { PublicCourseDto } from "@/lib/types/course";

export const dynamic = 'force-dynamic';

const CITIES = [
  "北京",
  "上海",
  "深圳",
  "杭州",
  "成都",
  "广州",
  "武汉",
  "南京",
];

const TESTIMONIALS = [
  {
    name: "小李",
    role: "应届毕业生",
    quote:
      '"之前只会用 AI 聊天，跟着培训做了一次简历优化，才发现原来能解决这么多实际问题。现在投简历都有底气多了。"',
    img: "/images/testimonial-alex.jpg",
    alt: "应届毕业生肖像",
  },
  {
    name: "王同学",
    role: "研究生",
    quote:
      '"零基础也能跟上，老师手把手带实操。论文文献整理那期培训帮我省了一周时间，内容还能复现，太实用了。"',
    img: "/images/testimonial-sarah.jpg",
    alt: "研究生肖像",
  },
  {
    name: "张女士",
    role: "职场人",
    quote:
      '"不是那种讲概念的课，每次培训都有看得见的成果。用 AI 做家庭教育方案设计，孩子学习效率真的提升了。"',
    img: "/images/testimonial-marcus.jpg",
    alt: "职场人肖像",
  },
];

const FOUNDERS = [
  {
    name: "John",
    role: "课程设计",
    img: "/images/founder-john.jpg",
    alt: "John头像",
  },
  {
    name: "小桃",
    role: "社区运营",
    img: "/images/founder-xiaotao.jpg",
    alt: "小桃头像",
  },
  {
    name: "Cozy",
    role: "技术支持",
    img: "/images/founder-cozy.jpg",
    alt: "Cozy头像",
  },
  {
    name: "zhangwei",
    role: "开发 & 助理",
    img: "/images/founder-zhangwei.jpg",
    alt: "zhangwei头像",
  },
].map((f) => ({ ...f, objectPosition: "center 35%" as const }));


export default async function Home() {
  // 获取公开课程，取前3个作为主题内容
  let publicCourses: PublicCourseDto[] = [];
  try {
    publicCourses = await CourseService.getPublicCourses();
  } catch (error) {
    console.error('Failed to fetch public courses for homepage:', error);
    // 构建时数据库可能不可用，使用默认数据
  }

  // 精选课程：取前3个公开课程（如果没有则显示空）
  const featuredCourses = publicCourses.slice(0, 3).map(course => ({
    slug: course.slug,
    title: course.title,
    desc: course.description || '',
    img: course.coverImageUrl || '/images/logo.jpg',
    alt: course.title,
    hours: '2h', // 默认值，后续可以从课程数据中提取
    level: '初级', // 默认值
  }));

  // 控制显示开关
  const showPricing = false;
  const showMembershipCTA = false;
  const showTestimonials = false;

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-50 backdrop-blur-md bg-cream/90">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo size={42} variant="header" />
            <span className="text-xl font-bold tracking-tight">Zero One</span>
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

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-cream px-6 pt-20 pb-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  敬请期待
                </span>
              </div>
              <h1 className="font-display text-5xl leading-[1.1] tracking-tight text-slate-700 md:text-7xl">
                从 0 到 1，用 AI 创造你的无限
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-slate-500">
                打破技术壁垒，任何人皆可从零起步。开启属于你的 AI 创造之旅，成为独特的数字化建造者。
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Link href="/community" className="rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-primary/90">
                  加入社区
                </Link>
                <Link
                  href="/courses"
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-8 py-4 text-base font-bold text-slate-700 transition-all hover:bg-slate-100"
                >
                  查看内容
                </Link>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-800 to-green-600 opacity-25 blur transition duration-1000 group-hover:opacity-40" />
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <Image
                  src="/images/hero.jpg"
                  alt="AI 赋能普通人创造价值的可视化"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Cities scroll */}
          <div className="relative mt-20 w-full overflow-hidden">
            <div className="animate-scroll flex gap-4 whitespace-nowrap py-4">
              {[...CITIES, ...CITIES].map((city) => (
                <div
                  key={city}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-6 py-3 shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg text-primary">
                    location_on
                  </span>
                  <span className="font-medium">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses */}
        <section id="courses" className="bg-cream px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex items-end justify-between">
              <div>
                <h2 className="font-display mb-4 text-4xl font-bold text-slate-700">
                  主题内容
                </h2>
                <p className="text-slate-500">
                  零门槛学习，场景实战，成果可见。从真实场景中掌握 AI 应用能力。
                </p>
              </div>
              <Link
                href="/courses"
                className="group flex items-center gap-1 font-bold text-primary"
              >
                全部内容
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>
            {featuredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featuredCourses.map((course) => (
                  <Link
                    key={course.slug || course.title}
                    href={course.slug ? `/courses/${course.slug}` : "/courses"}
                    className="group block rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition-all hover:border-primary/30"
                  >
                    <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                      <Image
                        src={course.img}
                        alt={course.alt}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-700">
                      {course.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-slate-500">
                      {course.desc}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">
                          schedule
                        </span>
                        {course.hours}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">
                          bar_chart
                        </span>
                        {course.level}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-8 py-16 text-center">
                <span className="material-symbols-outlined mb-4 text-5xl text-slate-300">
                  menu_book
                </span>
                <p className="mb-2 text-slate-600">暂无公开课程</p>
                <p className="text-sm text-slate-500">公开课程将会在这里展示</p>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        {showTestimonials && (
          <section className="bg-green-50/30 px-6 py-32">
            <div className="mx-auto max-w-7xl">
              <h2 className="font-display mb-16 text-center text-4xl font-bold text-slate-700">
                学员怎么说
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                {TESTIMONIALS.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-3xl border border-green-100 bg-white p-10 shadow-sm"
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        src={t.img}
                        alt={t.alt}
                        width={48}
                        height={48}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-700">{t.name}</h4>
                        <p className="text-xs text-slate-500">{t.role}</p>
                      </div>
                    </div>
                    <p className="italic text-slate-500">{t.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Founders */}
        <section className="bg-cream px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display mb-16 text-center text-4xl font-bold text-slate-700">
              共创团队
            </h2>
            <div className="flex flex-wrap justify-center gap-16">
              {FOUNDERS.map((f) => (
                <div
                  key={f.name}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-6 size-32 rounded-full border-4 border-primary/20 p-1 overflow-hidden">
                    <Image
                      src={f.img}
                      alt={f.alt}
                      width={128}
                      height={128}
                      className="h-full w-full rounded-full object-cover"
                      style={{ objectPosition: f.objectPosition }}
                    />
                  </div>
                  <h4 className="text-lg font-bold text-slate-700">{f.name}</h4>
                  <p className="text-sm text-slate-500">{f.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        {showMembershipCTA && (
          <section className="bg-cream px-6 py-32">
            <div className="mx-auto max-w-4xl">
              <div className="relative overflow-hidden rounded-3xl bg-primary p-12 text-white shadow-2xl md:p-20">
                <div className="absolute -mr-20 -mt-20 top-0 right-0 size-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -ml-20 -mb-20 bottom-0 left-0 size-60 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col items-center gap-8 text-center">
                  <div className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold uppercase tracking-widest backdrop-blur-sm">
                    限时创始成员招募
                  </div>
                  <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                    成为创始成员
                  </h2>
                  <p className="max-w-xl text-lg text-white/80">
                    从第一天起与我们一起成长，享受终身专属权益，和志同道合的人一起维护、贡献内容。
                  </p>
                  <div className="mt-4 grid w-full max-w-lg gap-4 text-left sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                      <span>场景化 AI 实战培训</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                      <span>社群交流与互助</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                      <span>创始成员标识</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                      <span>新内容抢先体验</span>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black">¥199</span>
                      <span className="text-xl text-white/60">/月</span>
                    </div>
                    <Link
                      href="/register"
                      className="w-full rounded-2xl bg-white px-12 py-5 text-center text-lg font-bold text-primary transition-all hover:shadow-lg sm:w-auto"
                    >
                      立即加入
                    </Link>
                    <p className="text-xs text-white/40">随时取消，无需承诺。</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white bg-green-50/30 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <span className="text-lg font-bold tracking-tight text-slate-700">
              Zero One
            </span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link
              href="#"
              className="font-medium transition-colors hover:text-primary"
            >
              隐私政策
            </Link>
            <Link
              href="#"
              className="font-medium transition-colors hover:text-primary"
            >
              服务条款
            </Link>
            <Link
              href="#"
              className="font-medium transition-colors hover:text-primary"
            >
              联系我们
            </Link>
          </div>
          <div className="flex gap-4">
            <Link
              href="#"
              className="flex size-10 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition-colors hover:text-primary"
            >
              <svg
                className="size-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </Link>
            <Link
              href="#"
              className="flex size-10 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition-colors hover:text-primary"
            >
              <svg
                className="size-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.819-.26.819-.578 0-.284-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.22 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl text-center text-xs text-slate-500">
          © 2024 Zero One. 用 AI 帮助普通人成长。
        </div>
      </footer>
    </div>
  );
}
