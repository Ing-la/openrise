import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "请输入章节名称").max(100),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id: courseId } = await params;

  const course = await prisma.course.findFirst({
    where: { id: courseId, userId: session.user.id },
  });
  if (!course) {
    return NextResponse.json({ error: "课程不存在" }, { status: 404 });
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

    const maxOrder = await prisma.chapter
      .aggregate({
        where: { courseId },
        _max: { sortOrder: true },
      })
      .then((r) => r._max.sortOrder ?? -1);

    const chapter = await prisma.chapter.create({
      data: {
        title: parsed.data.title,
        courseId,
        sortOrder: maxOrder + 1,
      },
    });

    return NextResponse.json(chapter);
  } catch (e) {
    console.error("Create chapter error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
