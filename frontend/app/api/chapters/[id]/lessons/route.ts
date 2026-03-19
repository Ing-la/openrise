import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { parseVideoUrl } from "@/lib/video";
import { z } from "zod";

const createSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("video"),
    title: z.string().min(1, "请输入标题").max(100),
    videoUrl: z.string().url("请输入有效的视频链接"),
  }),
  z.object({
    type: z.literal("markdown"),
    title: z.string().min(1, "请输入标题").max(100),
    content: z.string().min(1, "请输入内容"),
  }),
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id: chapterId } = await params;

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId },
    include: { course: true },
  });
  if (!chapter || chapter.course.userId !== session.user.id) {
    return NextResponse.json({ error: "章节不存在" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.lesson
      .aggregate({
        where: { chapterId },
        _max: { sortOrder: true },
      })
      .then((r) => r._max.sortOrder ?? -1);

    if (parsed.data.type === "video") {
      const videoInfo = parseVideoUrl(parsed.data.videoUrl);
      if (!videoInfo) {
        return NextResponse.json(
          { error: "仅支持 B站 或 YouTube 链接" },
          { status: 400 }
        );
      }
      const lesson = await prisma.lesson.create({
        data: {
          type: "video",
          title: parsed.data.title,
          chapterId,
          sortOrder: maxOrder + 1,
          videoUrl: parsed.data.videoUrl,
          platform: videoInfo.platform,
        },
      });
      return NextResponse.json(lesson);
    }

    const lesson = await prisma.lesson.create({
      data: {
        type: "markdown",
        title: parsed.data.title,
        chapterId,
        sortOrder: maxOrder + 1,
        content: parsed.data.content,
      },
    });
    return NextResponse.json(lesson);
  } catch (e) {
    console.error("Create lesson error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
