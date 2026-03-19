import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
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

  const chapter = await prisma.chapter.findFirst({
    where: { id },
    include: { course: true },
  });
  if (!chapter || chapter.course.userId !== session.user.id) {
    return NextResponse.json({ error: "章节不存在" }, { status: 404 });
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

    const updated = await prisma.chapter.update({
      where: { id },
      data: { title: parsed.data.title },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update chapter error:", e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  const chapter = await prisma.chapter.findFirst({
    where: { id },
    include: { course: true },
  });
  if (!chapter || chapter.course.userId !== session.user.id) {
    return NextResponse.json({ error: "章节不存在" }, { status: 404 });
  }

  await prisma.chapter.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
