"use client";

import { useMemo } from "react";
import { parseVideoUrl } from "@/lib/video";

export default function VideoLesson({
  url,
  platform,
}: {
  url: string;
  platform: string;
}) {
  const embedUrl = useMemo(() => {
    const info = parseVideoUrl(url);
    return info?.embedUrl ?? null;
  }, [url]);

  if (!embedUrl) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        无法解析视频链接
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="aspect-video w-full bg-slate-900">
        <iframe
          src={embedUrl}
          title="视频播放"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="p-4 text-sm text-slate-500">
        视频默认暂停，点击播放器内播放按钮开始播放
      </p>
    </div>
  );
}
