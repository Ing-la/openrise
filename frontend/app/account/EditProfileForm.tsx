"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";

export default function EditProfileForm({
  user,
}: {
  user: Pick<User, "name" | "avatarUrl" | "role" | "bio"> | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState(user?.role ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("type", "avatar");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        const hint =
          res.status === 413
            ? "文件过大，请压缩后重试"
            : `请求异常 (${res.status})，请检查服务器 Nginx 与容器日志`;
        throw new Error(hint);
      }
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      if (data.url) setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, bio, avatarUrl: avatarUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "更新失败");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative size-20 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                unoptimized={user.avatarUrl?.startsWith('/uploads/')}
                alt="头像"
                fill
                className="object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-3xl text-slate-400">
                <span className="material-symbols-outlined">person</span>
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {user?.name ?? "未设置昵称"}
            </h2>
            {user?.role && (
              <p className="text-sm text-slate-500">{user.role}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          编辑个人信息
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              讲师信息（用于课程展示）
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">头像</span>
                <div className="flex items-center gap-4">
                  <div className="relative size-16 overflow-hidden rounded-full border bg-slate-100">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        unoptimized={avatarUrl?.startsWith('/uploads/')}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-2xl text-slate-400">
                        <span className="material-symbols-outlined">person</span>
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="text-sm"
                    />
                    {uploading && (
                      <p className="mt-1 text-xs text-slate-500">上传中...</p>
                    )}
                  </div>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">昵称 *</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="讲师姓名"
                  className="rounded-lg border border-slate-200 px-4 py-3"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">职位/角色</span>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="例如：产品 & 设计总监"
                  className="rounded-lg border border-slate-200 px-4 py-3"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">简介</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="个人简介"
                  rows={3}
                  className="rounded-lg border border-slate-200 px-4 py-3"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
