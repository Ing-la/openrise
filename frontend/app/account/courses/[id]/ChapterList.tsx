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

  // 类型配置映射
  const typeConfig = {
    video: { icon: 'play_circle', label: '视频' },
    markdown: { icon: 'description', label: '文档' },
    pdf: { icon: 'picture_as_pdf', label: '文档' },
    image: { icon: 'photo_library', label: '图片' }
  } as const;

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

  async function handleDeleteChapter(chapterId: string, chapterTitle: string) {
    if (!confirm(`确定要删除章节 "${chapterTitle}" 吗？此操作不可撤销，将同时删除章节中的所有小节。`)) {
      return;
    }

    setError("");
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "删除失败");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteChapter(chapter.id, chapter.title);
                    }}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    删除章节
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
                            {typeConfig[lesson.type as keyof typeof typeConfig]?.icon || 'description'}
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
  const [type, setType] = useState<"video" | "markdown" | "pdf" | "image">("video");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

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

  async function handlePdfFile(file: File) {
    // 验证文件类型
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("请拖入 PDF 文件");
      return;
    }
    // 验证文件大小 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("PDF 文件大小不超过 50MB");
      return;
    }
    setPdfFile(file);
    if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
    setError("");
  }

  async function handleImageFiles(files: FileList) {
    const newFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 验证文件类型
      if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
        errors.push(`${file.name}: 仅支持 JPG, PNG, WebP 格式`);
        continue;
      }
      // 验证文件大小 (20MB)
      if (file.size > 20 * 1024 * 1024) {
        errors.push(`${file.name}: 图片大小不超过 20MB`);
        continue;
      }
      newFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join("; "));
    }

    if (newFiles.length > 0) {
      setImageFiles(prev => [...prev, ...newFiles]);
      if (!title && newFiles.length === 1) {
        setTitle(newFiles[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  }

  async function uploadPdfFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "pdf");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    // 尝试解析响应，处理可能的非JSON响应（如Nginx错误页面）
    let responseData;
    try {
      const responseText = await response.text();
      // 尝试解析JSON
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        // 如果不是JSON，可能是HTML错误页面
        if (!response.ok) {
          // 检查是否为413错误（请求体过大）
          if (response.status === 413) {
            throw new Error("文件大小超过服务器限制（最大50MB），请压缩PDF或使用更小的文件");
          }
          // 其他错误，返回原始文本或默认消息
          const errorText = responseText.length > 200 ? responseText.substring(0, 200) + "..." : responseText;
          throw new Error(`上传失败: 服务器返回错误 (${response.status}) - ${errorText}`);
        }
        // 如果response.ok但非JSON，这是异常情况
        throw new Error("服务器返回了无效的响应格式");
      }
    } catch (error) {
      // 如果连text()都失败，使用状态码信息
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(responseData?.error ?? `上传失败: ${response.status} ${response.statusText}`);
    }

    return responseData.url;
  }

  async function uploadImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    // 尝试解析响应，处理可能的非JSON响应（如Nginx错误页面）
    let responseData;
    try {
      const responseText = await response.text();
      // 尝试解析JSON
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        // 如果不是JSON，可能是HTML错误页面
        if (!response.ok) {
          // 检查是否为413错误（请求体过大）
          if (response.status === 413) {
            throw new Error("文件大小超过服务器限制（最大50MB），请压缩图片或使用更小的文件");
          }
          // 其他错误，返回原始文本或默认消息
          const errorText = responseText.length > 200 ? responseText.substring(0, 200) + "..." : responseText;
          throw new Error(`上传失败: 服务器返回错误 (${response.status}) - ${errorText}`);
        }
        // 如果response.ok但非JSON，这是异常情况
        throw new Error("服务器返回了无效的响应格式");
      }
    } catch (error) {
      // 如果连text()都失败，使用状态码信息
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(responseData?.error ?? `上传失败: ${response.status} ${response.statusText}`);
    }

    return responseData.url;
  }

  async function deleteUploadedImage(key: string): Promise<void> {
    const response = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // 尝试解析响应，处理可能的非JSON响应
      let errorData;
      try {
        const responseText = await response.text();
        // 尝试解析JSON
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          // 如果不是JSON，使用状态码信息
          const errorText = responseText.length > 200 ? responseText.substring(0, 200) + "..." : responseText;
          throw new Error(`删除失败: 服务器返回错误 (${response.status}) - ${errorText}`);
        }
      } catch (error) {
        // 如果连text()都失败，使用状态码信息
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`删除失败: ${response.status} ${response.statusText}`);
      }

      throw new Error(errorData?.error ?? `删除失败: ${response.status} ${response.statusText}`);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    if (type === "markdown") {
      handleMarkdownFile(files[0]);
    } else if (type === "pdf") {
      handlePdfFile(files[0]);
    } else if (type === "image") {
      handleImageFiles(files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (type === "markdown" || type === "pdf" || type === "image") setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let pdfUrl = "";

      // 如果是PDF类型，先上传文件
      if (type === "pdf") {
        if (!pdfFile) {
          throw new Error("请选择PDF文件");
        }
        setPdfUploading(true);
        try {
          pdfUrl = await uploadPdfFile(pdfFile);
        } catch (err) {
          throw new Error(`PDF上传失败: ${err instanceof Error ? err.message : "未知错误"}`);
        } finally {
          setPdfUploading(false);
        }
      }

      // 如果是图片类型，先上传所有图片文件
      let uploadedImageUrls: string[] = [];
      if (type === "image") {
        if (imageFiles.length === 0) {
          throw new Error("请至少选择一张图片");
        }
        setImageUploading(true);
        try {
          uploadedImageUrls = await Promise.all(
            imageFiles.map(file => uploadImageFile(file))
          );
          console.log("上传的图片URLs:", JSON.stringify(uploadedImageUrls, null, 2));
        } catch (err) {
          throw new Error(`图片上传失败: ${err instanceof Error ? err.message : "未知错误"}`);
        } finally {
          setImageUploading(false);
        }
      }

      const body =
        type === "video"
          ? { type: "video", title, videoUrl }
          : type === "markdown"
          ? { type: "markdown", title, content }
          : type === "pdf"
          ? { type: "pdf", title, pdfUrl }
          : { type: "image", title, imageUrls: uploadedImageUrls };

      console.log("创建小节请求体:", JSON.stringify(body, null, 2));
      const res = await fetch(`/api/chapters/${chapterId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("创建API失败:", { status: res.status, data });
        throw new Error(data.error ?? "添加失败");
      }

      // 重置表单
      setTitle("");
      setVideoUrl("");
      setContent("");
      setPdfFile(null);
      setImageFiles([]);
      setImageUrls([]);
      onSuccess();
    } catch (err) {
      console.error("创建小节失败:", err);
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
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            checked={type === "pdf"}
            onChange={() => setType("pdf")}
          />
          <span>PDF 文档</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            checked={type === "image"}
            onChange={() => setType("image")}
          />
          <span>图片</span>
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

      {type === "pdf" && (
        <label className="mb-3 block">
          <span className="text-sm font-medium text-slate-700">PDF 文件 *</span>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-slate-200"
            } ${pdfFile ? "border-green-200 bg-green-50" : ""}`}
          >
            {pdfFile ? (
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  picture_as_pdf
                </span>
                <p className="mt-2 font-medium text-green-700">{pdfFile.name}</p>
                <p className="mt-1 text-sm text-green-600">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="mt-3 text-sm text-red-600 hover:text-red-800"
                >
                  移除文件
                </button>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-slate-400 text-3xl">
                  upload
                </span>
                <p className="mt-2 text-slate-700">拖入 PDF 文件，或点击选择</p>
                <p className="mt-1 text-sm text-slate-500">支持 .pdf 格式，最大 50MB</p>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePdfFile(file);
                  }}
                  className="mt-3 hidden"
                  id="pdf-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                  className="mt-3 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  选择文件
                </button>
              </>
            )}
          </div>
        </label>
      )}

      {type === "image" && (
        <label className="mb-3 block">
          <span className="text-sm font-medium text-slate-700">图片 *</span>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-slate-200"
            }`}
          >
            {/* 图片预览列表 */}
            {imageFiles.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative rounded-lg border border-slate-200 bg-white p-2">
                      <div className="aspect-square overflow-hidden rounded-md bg-slate-100">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-2 truncate text-xs font-medium text-slate-700">{file.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFiles(files => files.filter((_, i) => i !== index));
                        }}
                        className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) handleImageFiles(files);
                    }}
                    className="hidden"
                    id="image-upload-multiple"
                    multiple
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("image-upload-multiple")?.click()}
                    className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                  >
                    继续添加图片
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageFiles([])}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    清空所有
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-slate-400 text-3xl">
                  photo_library
                </span>
                <p className="mt-2 text-slate-700">拖入图片文件，或点击选择</p>
                <p className="mt-1 text-sm text-slate-500">支持 JPG、PNG、WebP 格式，每张不超过 20MB</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) handleImageFiles(files);
                  }}
                  className="mt-3 hidden"
                  id="image-upload"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  className="mt-3 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  选择图片
                </button>
              </>
            )}
          </div>
        </label>
      )}

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || pdfUploading || imageUploading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading || pdfUploading || imageUploading ? "添加中..." : "添加"}
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
