"use client";

import Image from "next/image";
import Link from "next/link";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
}

export default function ComingSoon({
  title = "敬请期待：我们正在打造特别的内容",
  subtitle = "用 AI 帮助普通人成长，零门槛学习，场景实战。敬请期待。",
}: ComingSoonProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-8 md:px-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-gray-200/90 shadow-sm">
            <Image
              src="/images/logo.jpg"
              alt="零壹"
              width={42}
              height={42}
              className="rounded-lg"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            零壹
          </h2>
        </Link>
        <Link
          href="/"
          className="flex min-w-[140px] cursor-pointer items-center justify-center rounded bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
        >
          返回首页
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-[1000px] flex-col items-center text-center">
          <div className="relative mb-16 flex h-40 w-full max-w-[1000px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 md:h-56">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="z-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-7xl text-primary/30">
                architecture
              </span>
              <div className="mt-6 h-px w-40 bg-primary/20" />
            </div>
          </div>

          <div className="max-w-4xl space-y-8">
            <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-slate-600 md:text-xl">
              {subtitle}
            </p>
          </div>

          <div className="mt-16 w-full max-w-lg">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full flex-col gap-3 rounded-xl border border-primary/10 bg-white p-2 shadow-lg shadow-primary/5 sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 px-4">
                <span className="material-symbols-outlined text-slate-400">
                  mail
                </span>
                <input
                  className="w-full border-0 bg-transparent py-3 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0"
                  placeholder="请输入您的邮箱"
                  type="email"
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-10 py-3 font-semibold text-white transition-all hover:opacity-95"
              >
                <span>订阅通知</span>
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </form>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
              加入抢先体验名单
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-10 border-t border-slate-200 bg-slate-50 px-6 py-16 md:px-20">
        <div className="flex flex-col items-center gap-6">
          <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            关注我们
          </h4>
          <div className="flex gap-5">
            <Link
              href="#"
              aria-label="Social Media"
              className="flex size-12 items-center justify-center rounded-full border border-primary/10 bg-white text-primary shadow-sm transition-all hover:bg-primary hover:text-white"
            >
              <span className="material-symbols-outlined">share</span>
            </Link>
            <Link
              href="#"
              aria-label="Twitter/X"
              className="flex size-12 items-center justify-center rounded-full border border-primary/10 bg-white text-primary shadow-sm transition-all hover:bg-primary hover:text-white"
            >
              <span className="material-symbols-outlined">flutter_dash</span>
            </Link>
            <Link
              href="#"
              aria-label="Github"
              className="flex size-12 items-center justify-center rounded-full border border-primary/10 bg-white text-primary shadow-sm transition-all hover:bg-primary hover:text-white"
            >
              <span className="material-symbols-outlined">code</span>
            </Link>
          </div>
        </div>
        <div className="flex w-full max-w-[1200px] flex-col items-center justify-between gap-6 border-t border-primary/5 pt-10 md:flex-row">
          <div className="flex gap-10">
            <Link
              href="#"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-primary"
            >
              隐私政策
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-primary"
            >
              服务条款
            </Link>
          </div>
          <p className="text-sm font-medium text-slate-400">
            © 2024 零壹. 用 AI 帮助普通人成长。
          </p>
        </div>
      </footer>
    </div>
  );
}
