"use client";

export default function ImageLesson({ imageUrls }: { imageUrls: string[] }) {
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">暂无图片</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">图片</h2>
        <span className="text-sm text-slate-500">
          共 {imageUrls.length} 张
        </span>
      </div>

      <div className="space-y-6">
        {imageUrls.map((url, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex justify-center p-4">
              <img
                src={url}
                alt={`图片 ${index + 1}`}
                className="max-h-[800px] max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2">
              <span className="text-sm text-slate-600">图片 {index + 1}</span>
              <div className="flex gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  新窗口打开
                </a>
                <span className="text-slate-300">|</span>
                <a
                  href={url}
                  download
                  className="text-xs font-medium text-primary hover:underline"
                >
                  下载
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}