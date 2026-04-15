"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LessonActionsProps {
  lesson: {
    id: string;
    title: string;
    type: string;
    isPublic: boolean;
    chapter: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
        isPublic: boolean;
      };
    };
  };
}

export default function LessonActions({ lesson }: LessonActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [isPublic, setIsPublic] = useState(lesson.isPublic);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpdateLesson() {
    if (title.trim() === "") {
      setError("标题不能为空");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 更新小节标题和可见性
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, isPublic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "更新失败");

      setSuccess("更新成功");
      setTimeout(() => {
        setEditOpen(false);
        setSuccess("");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteLesson() {
    if (!confirm(`确定要删除小节 "${lesson.title}" 吗？此操作不可撤销。`)) {
      return;
    }

    setError("");
    setSuccess("");
    setDeleting(true);

    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "删除失败");

      // 删除成功后跳转到课程页面
      router.push(`/account/courses/${lesson.chapter.course.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
      setDeleting(false);
    }
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3">
        {/* 管理图片按钮（仅图片类型显示） */}
        {lesson.type === "image" && (
          <button
            type="button"
            onClick={() => {
              const manager = document.querySelector(".image-manager-section");
              if (manager) {
                manager.scrollIntoView({ behavior: "smooth" });
                // 如果管理面板是收起的，可以自动展开
                const toggleBtn = manager.querySelector("button");
                if (toggleBtn && !toggleBtn.textContent?.includes("收起")) {
                  toggleBtn.click();
                }
              }
            }}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            管理图片
          </button>
        )}

        {/* 编辑小节按钮 */}
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          编辑小节
        </button>
      </div>

      {/* 编辑模态框 */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">编辑小节</h3>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="关闭"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">小节标题 *</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-lg border border-slate-200 px-4 py-3"
                  required
                />
              </label>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-700">小节可见性</p>
                  <p className="text-sm text-slate-500">
                    仅影响当前小节
                  </p>
                </div>
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
                  {isPublic ? "公开" : "私有"}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 rounded-lg border px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleUpdateLesson}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "保存中..." : "保存"}
                </button>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleDeleteLesson}
                  disabled={deleting || loading}
                  className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {deleting ? "删除中..." : "删除小节"}
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  注意：删除后将无法恢复，小节将从课程中永久移除。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}