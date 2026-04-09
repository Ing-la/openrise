"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (!token) {
      setError("链接无效，请重新申请重置");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "重置失败");
        return;
      }

      router.push("/login?reset=1");
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
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
          <div className="w-full max-w-md text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">链接无效</h1>
            <p className="mb-8 text-slate-600">
              请使用邮件中的完整链接，或重新申请重置密码。
            </p>
            <Link
              href="/forgot-password"
              className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
            >
              重新申请
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
        <Link
          href="/login"
          className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
        >
          返回登录
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            设置新密码
          </h1>
          <p className="mb-8 text-slate-600">
            请输入新密码，至少 6 位
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">新密码</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                className="rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                minLength={6}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">确认密码</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
                className="rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                minLength={6}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "重置中..." : "重置密码"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">加载中...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
