"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const onTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    const win = window as { onTurnstileSuccess?: (token: string) => void };
    win.onTurnstileSuccess = onTurnstileVerify;
    return () => {
      delete win.onTurnstileSuccess;
    };
  }, [onTurnstileVerify]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("请完成人机验证");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          turnstileToken,
          website: honeypotRef.current?.value ?? "",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "注册失败");
        return;
      }

      router.push("/register/success");
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
          已有账号？去登录
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            注册 零壹
          </h1>
          <p className="mb-8 text-slate-600">
            加入我们，用 AI 帮助自己成长
          </p>

          <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 蜜罐：对人类隐藏，机器人会填 */}
            <div
              className="absolute -left-[9999px] opacity-0 pointer-events-none"
              aria-hidden="true"
            >
              <label htmlFor="website">网站</label>
              <input
                ref={honeypotRef}
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">昵称</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入昵称"
                className="rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </label>

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
                placeholder="至少 6 位"
                className="rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                minLength={6}
              />
            </label>

            {/* Cloudflare Turnstile 人机验证 */}
            {TURNSTILE_SITE_KEY && (
              <>
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                  strategy="lazyOnload"
                />
                <div
                  className="cf-turnstile"
                  data-sitekey={TURNSTILE_SITE_KEY}
                  data-callback="onTurnstileSuccess"
                  data-theme="light"
                  data-size="normal"
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
              className="mt-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
