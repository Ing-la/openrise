"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Chapter = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: {
    id: string;
    type: string;
    title: string;
    sortOrder: number;
  }[];
};

export default function ChapterList({
  courseId,
  chapters,
}: {
  courseId: string;
  chapters: Chapter[];
  user: { avatarUrl: string | null; name: string | null; role: string | null; bio: string | null };
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addChapterOpen, setAddChapterOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState<string | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleChapter = (id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newChapterTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "创建失败");
      setNewChapterTitle("");
      setAddChapterOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAddChapterOpen(true)}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          添加章节
        </button>
      </div>

      {addChapterOpen && (
        <form
          onSubmit={handleAddChapter}
          className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <input
            type="text"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            placeholder="章节名称"
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "添加中..." : "添加"}
          </button>
          <button
            type="button"
            onClick={() => setAddChapterOpen(false)}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            取消
          </button>
          {error && (
            <p className="w-full text-sm text-red-600">{error}</p>
          )}
        </form>
      )}

      {chapters.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white px-8 py-12 text-center">
          <p className="text-slate-500">暂无章节，请先添加章节</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {chapters.map((chapter, i) => (
            <details
              key={chapter.id}
              open={expanded[chapter.id] ?? i === 0}
              onToggle={() => toggleChapter(chapter.id)}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-semibold text-slate-900">{chapter.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">
                    {chapter.lessons.length} 节
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setAddLessonOpen(addLessonOpen === chapter.id ? null : chapter.id);
                    }}
                    className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
                  >
                    添加小节
                  </button>
                  <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">
                    expand_more
                  </span>
                </div>
              </summary>
              <div className="border-t border-slate-100 p-6 pt-4">
                {addLessonOpen === chapter.id && (
                  <AddLessonForm
                    chapterId={chapter.id}
                    onClose={() => {
                      setAddLessonOpen(null);
                      router.refresh();
                    }}
                    onSuccess={() => {
                      router.refresh();
                    }}
                  />
                )}
                {chapter.lessons.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">
                    暂无小节
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chapter.lessons.map((lesson, _j) => (
                      <Link
                        key={lesson.id}
                        href={`/account/lessons/${lesson.id}`}
                        className="flex items-center justify-between rounded-lg border border-transparent p-4 transition-colors hover:border-primary/20 hover:bg-primary/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400">
                            {lesson.type === "video" ? "play_circle" : "description"}
                          </span>
                          <span className="font-medium text-slate-700">
                            {lesson.title}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">
                          arrow_forward
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function AddLessonForm({
  chapterId,
  onClose,
  onSuccess,
}: {
  chapterId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<"video" | "markdown">("video");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  async function handleMarkdownFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".md") && !file.name.toLowerCase().endsWith(".markdown")) {
      setError("请拖入 .md 或 .markdown 文件");
      return;
    }
    try {
      const text = await file.text();
      setContent(text);
      if (!title) setTitle(file.name.replace(/\.(md|markdown)$/i, ""));
      setError("");
    } catch {
      setError("读取文件失败");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && type === "markdown") handleMarkdownFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (type === "markdown") setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body =
        type === "video"
          ? { type: "video", title, videoUrl }
          : { type: "markdown", title, content };
      const res = await fetch(`/api/chapters/${chapterId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "添加失败");
      setTitle("");
      setVideoUrl("");
      setContent("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            checked={type === "video"}
            onChange={() => setType("video")}
          />
          <span>视频</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            checked={type === "markdown"}
            onChange={() => setType("markdown")}
          />
          <span>Markdown 文档</span>
        </label>
      </div>

      <label className="mb-3 block">
        <span className="text-sm font-medium text-slate-700">标题 *</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2"
          required
        />
      </label>

      {type === "video" && (
        <label className="mb-3 block">
          <span className="text-sm font-medium text-slate-700">视频链接 *</span>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="B站 或 YouTube 链接"
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2"
            required={type === "video"}
          />
        </label>
      )}

      {type === "markdown" && (
        <label className="mb-3 block">
          <span className="text-sm font-medium text-slate-700">Markdown 内容 *</span>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-1 rounded-lg border-2 border-dashed px-4 py-2 transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-slate-200"
            }`}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入 Markdown 内容，或拖入 .md 文件..."
              rows={6}
              className="w-full resize-none border-none bg-transparent font-mono text-sm outline-none"
              required={type === "markdown"}
            />
            <p className="mt-1 text-xs text-slate-400">支持拖入 .md / .markdown 文件</p>
          </div>
        </label>
      )}

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "添加中..." : "添加"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          取消
        </button>
      </div>
    </form>
  );
}
