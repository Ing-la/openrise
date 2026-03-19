import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "请输入课程名称").max(100),
  description: z.string().max(500).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { chapters: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
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

    const course = await prisma.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(course);
  } catch (e) {
    console.error("Create course error:", e);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
