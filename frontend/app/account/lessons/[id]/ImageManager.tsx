"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ImageManagerProps {
  lessonId: string;
  initialImageUrls: string[];
}

export default function ImageManager({ lessonId, initialImageUrls }: ImageManagerProps) {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function uploadImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? "上传失败");
    }

    const data = await response.json();
    return data.url;
  }

  async function handleAddImages(files: FileList) {
    const newFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
        errors.push(`${file.name}: 仅支持 JPG, PNG, WebP 格式`);
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        errors.push(`${file.name}: 图片大小不超过 20MB`);
        continue;
      }
      newFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join("; "));
      setTimeout(() => setError(""), 5000);
    }

    if (newFiles.length > 0) {
      setNewImages(prev => [...prev, ...newFiles]);
    }
  }

  async function handleSave() {
    if (newImages.length === 0) {
      setError("请先选择要添加的图片");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      // 上传新图片
      const uploadedUrls = await Promise.all(
        newImages.map(file => uploadImageFile(file))
      );

      // 调用API添加到lesson
      const response = await fetch(`/api/lessons/${lessonId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          urls: uploadedUrls,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "添加图片失败");
      }

      const updatedLesson = await response.json();
      setImageUrls(updatedLesson.imageUrls || []);
      setNewImages([]);
      setSuccess(`成功添加 ${uploadedUrls.length} 张图片`);
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteImage(url: string) {
    if (!confirm("确定要删除这张图片吗？")) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/lessons/${lessonId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          urls: [url],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "删除图片失败");
      }

      const updatedLesson = await response.json();
      setImageUrls(updatedLesson.imageUrls || []);
      setSuccess("图片已删除");
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
      setTimeout(() => setError(""), 5000);
    }
  }

  return (
    <div className="mt-8 image-manager-section">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">图片管理</h2>
        <button
          type="button"
          onClick={() => setIsManaging(!isManaging)}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          {isManaging ? "收起管理" : "管理图片"}
        </button>
      </div>

      {isManaging && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* 现有图片列表 */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">现有图片 ({imageUrls.length})</h3>
            {imageUrls.length === 0 ? (
              <p className="text-slate-500">暂无图片</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg border border-slate-200">
                    <div className="aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={url}
                        alt={`图片 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-slate-700">图片 {index + 1}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(url)}
                      className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 添加新图片 */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">添加新图片</h3>
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
              {newImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {newImages.map((file, index) => (
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
                            setNewImages(files => files.filter((_, i) => i !== index));
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
                        if (files) handleAddImages(files);
                      }}
                      className="hidden"
                      id="manager-image-upload"
                      multiple
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("manager-image-upload")?.click()}
                      className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                    >
                      继续添加
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewImages([])}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      清空
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-slate-400 text-3xl">
                    photo_library
                  </span>
                  <p className="mt-2 text-slate-700">选择要添加的图片文件</p>
                  <p className="mt-1 text-sm text-slate-500">支持 JPG、PNG、WebP 格式，每张不超过 20MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) handleAddImages(files);
                    }}
                    className="mt-3 hidden"
                    id="manager-image-upload-initial"
                    multiple
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("manager-image-upload-initial")?.click()}
                    className="mt-3 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                  >
                    选择图片
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsManaging(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isUploading || newImages.length === 0}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isUploading ? "上传中..." : `保存 (${newImages.length} 张新图片)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}