import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { verifyToken } from "@/lib/verify";

export const metadata: Metadata = {
  title: "验证邮箱 | Zero One",
  description: "验证你的 Zero One 邮箱",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <VerifyLayout>
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">链接无效</h1>
        <p className="mb-8 text-slate-600">请使用邮件中的完整链接重试。</p>
        <Link
          href="/login"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
        >
          前往登录
        </Link>
      </VerifyLayout>
    );
  }

  const result = await verifyToken(token);

  if (result.success) {
    return (
      <VerifyLayout>
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">验证成功</h1>
        <p className="mb-8 text-slate-600">你的邮箱已验证，现在可以登录了。</p>
        <Link
          href="/login?verified=1"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
        >
          前往登录
        </Link>
      </VerifyLayout>
    );
  }

  return (
    <VerifyLayout>
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <span className="material-symbols-outlined text-4xl">schedule</span>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        {result.error === "expired" ? "链接已过期" : "验证失败"}
      </h1>
      <p className="mb-8 text-slate-600">
        {result.error === "expired"
          ? "验证链接已过期，请重新注册或联系客服。"
          : "验证失败，请使用邮件中的最新链接重试。"}
      </p>
      <Link
        href="/register"
        className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition-all hover:bg-primary/5"
      >
        重新注册
      </Link>
    </VerifyLayout>
  );
}

function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6 md:px-20">
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
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          {children}
        </div>
      </main>
    </div>
  );
}
