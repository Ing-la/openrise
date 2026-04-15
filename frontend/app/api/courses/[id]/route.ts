import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// 接受完整 URL 或相对路径（如 /uploads/cover/xxx.png）
const urlOrPath = z.union([
  z.string().url(),
  z.string().regex(/^\/[a-zA-Z0-9/_.-]+$/, "请输入有效的图片地址"),
]);
const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  coverImageUrl: z.union([urlOrPath, z.literal("")]).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  const course = await prisma.course.findFirst({
    where: { id, userId: session.user.id },
    include: {
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "课程不存在" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  const course = await prisma.course.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!course) {
    return NextResponse.json({ error: "课程不存在" }, { status: 404 });
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
    if (parsed.data.description !== undefined)
      data.description = parsed.data.description ?? null;
    if (parsed.data.coverImageUrl !== undefined)
      data.coverImageUrl = parsed.data.coverImageUrl || null;
    if (parsed.data.isPublic !== undefined) data.isPublic = parsed.data.isPublic;

    const updated = await prisma.course.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update course error:", e);
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

  // 验证课程所有权
  const course = await prisma.course.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!course) {
    return NextResponse.json({ error: "课程不存在或无权删除" }, { status: 404 });
  }

  try {
    // 使用级联删除，自动删除相关章节和小节
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete course error:", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
