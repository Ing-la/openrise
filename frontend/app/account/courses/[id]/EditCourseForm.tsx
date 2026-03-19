"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function EditCourseForm({
  course,
}: {
  course: {
    id: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    user?: { name: string | null };
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(course.coverImageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("type", "cover");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      setCoverImageUrl(data.url);
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
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          coverImageUrl: coverImageUrl || undefined,
        }),
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
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-200 md:w-64 md:shrink-0">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-5xl text-slate-400">
              <span className="material-symbols-outlined">play_circle</span>
            </span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">{course.title}</h1>
          {course.description && (
            <p className="mb-4 text-slate-600">{course.description}</p>
          )}
          {course.user && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>讲师：{course.user.name ?? "未设置"}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            编辑课程信息
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">编辑课程</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">封面图</span>
                <div className="flex items-center gap-4">
                  <div className="relative size-24 overflow-hidden rounded-lg border bg-slate-100">
                    {coverImageUrl ? (
                      <Image src={coverImageUrl} alt="" fill className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-2xl text-slate-400">
                        <span className="material-symbols-outlined">image</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploading}
                    className="text-sm"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">课程名称 *</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-lg border border-slate-200 px-4 py-3"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">简介</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
