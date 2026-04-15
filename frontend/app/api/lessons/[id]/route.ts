import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: {
      chapter: { include: { course: true } },
    },
  });

  if (!lesson || lesson.chapter.course.userId !== session.user.id) {
    return NextResponse.json({ error: "小节不存在" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}

const updateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100).optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  // 验证小节所有权
  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: {
      chapter: { include: { course: true } },
    },
  });
  if (!lesson || lesson.chapter.course.userId !== session.user.id) {
    return NextResponse.json({ error: "小节不存在或无权访问" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.isPublic !== undefined) data.isPublic = parsed.data.isPublic;

    const updated = await prisma.lesson.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update lesson error:", e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  // 验证小节所有权
  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: {
      chapter: { include: { course: true } },
    },
  });
  if (!lesson || lesson.chapter.course.userId !== session.user.id) {
    return NextResponse.json({ error: "小节不存在或无权删除" }, { status: 404 });
  }

  try {
    // 级联删除由Prisma关系处理
    await prisma.lesson.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete lesson error:", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
