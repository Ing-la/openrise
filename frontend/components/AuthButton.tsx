"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface AuthButtonProps {
  variant?: "default" | "courses";
}

export default function AuthButton({ variant = "default" }: AuthButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
    );
  }

  if (session?.user) {
    if (variant === "courses") {
      return (
        <Link
          href="/account"
          className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 text-primary transition-colors hover:bg-emerald-100"
        >
          <span className="material-symbols-outlined text-xl">person</span>
        </Link>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/account"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary/90"
        >
          个人中心
        </Link>
        <button
          onClick={() => signOut()}
          className="text-sm font-medium text-slate-500 transition-colors hover:text-primary"
        >
          退出
        </button>
      </div>
    );
  }

  if (variant === "courses") {
    return (
      <Link
        href="/login"
        className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 text-primary transition-colors hover:bg-emerald-100"
      >
        <span className="material-symbols-outlined text-xl">person</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
      >
        登录
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary/90"
      >
        注册
      </Link>
    </div>
  );
}
