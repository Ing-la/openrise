"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "请求失败");
        return;
      }

      setSent(true);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6 md:px-20">
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
          href="/login"
          className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
        >
          返回登录
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            忘记密码
          </h1>
          <p className="mb-8 text-slate-600">
            输入注册邮箱，我们将发送重置链接到你的邮箱
          </p>

          {sent ? (
            <div className="rounded-lg bg-emerald-50 px-4 py-6 text-center">
              <p className="mb-4 text-emerald-700">
                若该邮箱已注册，将收到重置链接，请查收邮件。
              </p>
              <Link
                href="/login"
                className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
              >
                返回登录
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">邮箱</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入注册邮箱"
                  className="rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "发送中..." : "发送重置链接"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
