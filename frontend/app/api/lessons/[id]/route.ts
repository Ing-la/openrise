import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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
