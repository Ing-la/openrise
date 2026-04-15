"use client";

import Link from "next/link";
import { useState } from "react";

type Lesson = { title: string; duration: string; id?: string; type?: string };

export default function CollapsibleChapter({
  index,
  title,
  lessonCount,
  lessons,
  defaultOpen,
  isUserCourse = false,
  courseSlug,
}: {
  index: number;
  title: string;
  lessonCount: number;
  lessons: Lesson[];
  defaultOpen: boolean;
  isUserCourse?: boolean;
  courseSlug?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-accent-sage/30 bg-white shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className="flex w-full cursor-pointer select-none items-center justify-between p-6 text-left transition-colors hover:bg-accent-sage/10 focus:outline-none"
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      >
        <div className="flex items-center gap-4">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-lg font-bold text-primary">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-400">{lessonCount} 节</span>
          <span className="material-symbols-outlined text-primary">
            {open ? "expand_less" : "expand_more"}
          </span>
        </div>
      </div>
      {open && (
        <div className="space-y-4 border-t border-accent-sage/20 p-6 pt-4">
          {lessons.length > 0 ? (
            lessons.map((lesson, j) => {
              const canLink = isUserCourse && lesson.id;
              // 类型配置映射
              const typeConfig = {
                video: { icon: 'play_circle', label: '视频' },
                markdown: { icon: 'description', label: '文档' },
                pdf: { icon: 'picture_as_pdf', label: '文档' },
                image: { icon: 'photo_library', label: '图片' }
              } as const;
              const iconName = lesson.type && typeConfig[lesson.type as keyof typeof typeConfig]
                ? typeConfig[lesson.type as keyof typeof typeConfig].icon
                : (lesson.type === 'markdown' ? 'description' : 'play_circle');
              const content = (
                <>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 group-hover/item:text-primary">
                      {iconName}
                    </span>
                    <p className="font-medium text-slate-700">{lesson.title}</p>
                  </div>
                  <span className="text-xs text-slate-400">{lesson.duration}</span>
                </>
              );
              return canLink && lesson.id ? (
                <Link
                  key={lesson.id}
                  href={courseSlug ? `/courses/${courseSlug}/lessons/${lesson.id}` : `/courses/lessons/${lesson.id}`}
                  className="group/item flex items-center justify-between rounded-xl border border-transparent p-4 transition-colors hover:border-accent-sage/20 hover:bg-accent-sage/5"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={j}
                  className="group/item flex items-center justify-between rounded-xl border border-transparent p-4 transition-colors hover:border-accent-sage/20 hover:bg-accent-sage/5"
                >
                  {content}
                </div>
              );
            })
          ) : (
            <p className="text-sm italic text-slate-500">内容即将上线，敬请期待...</p>
          )}
        </div>
      )}
    </div>
  );
}
