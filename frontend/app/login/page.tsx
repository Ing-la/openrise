"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const reset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("邮箱或密码错误");
        return;
      }

      router.push("/");
      router.refresh();
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
        <Link
          href="/register"
          className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
        >
          没有账号？去注册
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            登录 OpenRise
          </h1>
          <p className="mb-8 text-slate-600">
            欢迎回来，继续你的 AI 学习之旅
          </p>
          <p className="mb-4 text-sm text-slate-500">
            若刚注册，请先点击邮件中的验证链接完成验证后再登录。
          </p>

          <Link
            href="/forgot-password"
            className="mb-4 block text-sm font-medium text-primary hover:underline"
          >
            忘记密码？
          </Link>

          {registered && (
            <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              注册成功！请登录
            </div>
          )}

          {reset && (
            <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              密码已重置，请重新登录
            </div>
          )}

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
                placeholder="请输入邮箱"
                className="rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">密码</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
