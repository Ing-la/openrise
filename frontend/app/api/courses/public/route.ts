import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 示例课程的 slug 到 topic 的映射
const EXAMPLE_COURSE_TOPICS: Record<string, string> = {
  // Core Courses
  "ai-foundations": "求职就业",
  "generative-design": "论文调研",
  "llm-engineering": "家庭教育",

  // Catalog Courses
  "neural-network-architectures": "论文调研",
  "ui-ux-design-masterclass": "工作效率",
  "full-stack-ecosystems": "工作效率",
  "process-engineering": "工作效率",
  "predictive-data-modeling": "论文调研",
  "systems-optimization": "工作效率",
};

/**
 * 公开接口：获取内容库中的全部课程（含用户创建的）
 * 用于 /courses 页面展示
 */
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublic: true }, // 只返回公开课程
      include: {
        user: {
          select: { email: true, name: true, avatarUrl: true, role: true, bio: true },
        },
        _count: { select: { chapters: true } },
        chapters: {
          include: {
            lessons: {
              where: { isPublic: true }, // 只计算公开小节
              select: { id: true }
            }
          }
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      courses.map((c) => {
        // 确定课程类型和 topic
        const isExampleCourse = c.user?.email === "01builder@openrise.com";
        const courseSlug = c.id; // 对于数据库课程，使用ID作为slug
        let topic = "用户创作";

        if (isExampleCourse && c.description) {
          // 尝试从描述中提取原始 slug
          const match = c.description.match(/\[示例:([^\]]+)\]/);
          if (match) {
            const originalSlug = match[1];
            topic = EXAMPLE_COURSE_TOPICS[originalSlug] || "示例课程";
          } else {
            topic = "示例课程";
          }
        }

        return {
          id: c.id,
          slug: courseSlug, // 用户课程用 id 作为 slug 访问
          title: c.title,
          desc: c.description ?? "",
          img: c.coverImageUrl ?? "/images/logo.jpg",
          alt: c.title,
          topic,
          isUserCourse: !isExampleCourse, // 示例课程不算用户创作
          isExampleCourse,
          chapterCount: c._count.chapters,
          lessonCount: c.chapters.reduce((s, ch) => s + ch.lessons.length, 0), // 只计算公开小节
          instructor: c.user
            ? {
                name: c.user.name ?? "匿名",
                role: c.user.role ?? "",
                bio: c.user.bio ?? "",
                img: c.user.avatarUrl ?? "/images/logo.jpg",
              }
            : undefined,
        };
      })
    );
  } catch (e) {
    console.error("Fetch public courses error:", e);
    // 数据库错误时返回空数组，保持API健壮性
    return NextResponse.json([]);
  }
}
