import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 公开接口：获取案例库中的全部课程（含用户创建的）
 * 用于 /courses 页面展示
 */
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        user: {
          select: { name: true, avatarUrl: true, role: true, bio: true },
        },
        _count: { select: { chapters: true } },
        chapters: {
          include: { _count: { select: { lessons: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      courses.map((c) => ({
        id: c.id,
        slug: c.id, // 用户课程用 id 作为 slug 访问
        title: c.title,
        desc: c.description ?? "",
        img: c.coverImageUrl ?? "/images/logo.jpg",
        alt: c.title,
        topic: "用户创作",
        isUserCourse: true,
        chapterCount: c._count.chapters,
        lessonCount: c.chapters.reduce((s, ch) => s + ch._count.lessons, 0),
        instructor: c.user
          ? {
              name: c.user.name ?? "匿名",
              role: c.user.role ?? "",
              bio: c.user.bio ?? "",
              img: c.user.avatarUrl ?? "/images/logo.jpg",
            }
          : undefined,
      }))
    );
  } catch (e) {
    console.error("Fetch public courses error:", e);
    return NextResponse.json({ error: "获取课程列表失败" }, { status: 500 });
  }
}
