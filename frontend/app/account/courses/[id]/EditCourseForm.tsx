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
    isPublic: boolean;
    user?: { name: string | null };
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(course.coverImageUrl ?? "");
  const [isPublic, setIsPublic] = useState(course.isPublic);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      console.log("开始上传封面文件:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });

      const formData = new FormData();
      formData.set("file", file);
      formData.set("type", "cover");

      console.log("调用上传API...");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("上传API响应状态:", res.status, "响应文本:", text);

      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(text);
        console.log("解析的响应数据:", data);
      } catch {
        console.error("无法解析JSON响应:", text);
        const hint =
          res.status === 413
            ? "文件过大，请压缩后重试"
            : `请求异常 (${res.status})，请检查服务器 Nginx 与容器日志`;
        throw new Error(hint);
      }

      if (!res.ok) {
        console.error("上传失败，错误:", data.error);
        throw new Error(data.error ?? "上传失败");
      }

      if (data.url) {
        console.log("上传成功，设置coverImageUrl为:", data.url);
        setCoverImageUrl(data.url);

        // 记录图片URL用于调试
        console.log("图片URL:", data.url);
      } else {
        console.error("响应中没有URL字段");
        throw new Error("服务器响应异常，未返回文件URL");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "上传失败";
      console.error("封面上传错误:", errorMsg, err);
      setError(errorMsg);
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
          isPublic,
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
              unoptimized={course.coverImageUrl?.indexOf('/uploads/') === 0}
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
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              编辑课程信息
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm(`确定要删除课程 "${course.title}" 吗？此操作不可撤销，将删除所有章节和小节内容。`)) {
                  return;
                }

                setError("");
                setDeleting(true);
                try {
                  const res = await fetch(`/api/courses/${course.id}`, {
                    method: "DELETE",
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error ?? "删除失败");

                  // 删除成功后跳转到课程列表
                  router.push("/account");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "删除失败");
                  setTimeout(() => setError(""), 5000);
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              {deleting ? "删除中..." : "删除课程"}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">编辑课程</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="关闭"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                      <Image src={coverImageUrl} alt="" fill className="object-cover" unoptimized={coverImageUrl?.indexOf('/uploads/') === 0} />
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

              <label className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-700">课程可见性</span>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublic ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-500">
                  {isPublic ? "公开（所有人可见）" : "私有（仅自己可见）"}
                </span>
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
