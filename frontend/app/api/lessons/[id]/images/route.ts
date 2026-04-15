import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { deleteFile } from "@/lib/s3";
import { z } from "zod";

const updateSchema = z.object({
  action: z.enum(["add", "remove"]),
  urls: z.array(
    z.string().min(1, "图片链接不能为空").refine(
      (url) => {
        const trimmed = url.trim();
        return trimmed.startsWith('/uploads/') || z.string().url().safeParse(trimmed).success;
      },
      { message: "图片链接必须以 /uploads/ 开头或者是有效的URL" }
    )
  ),
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

  // 验证lesson所有权
  const lesson = await prisma.lesson.findFirst({
    where: { id },
    include: {
      chapter: { include: { course: true } },
    },
  });

  if (!lesson || lesson.chapter.course.userId !== session.user.id) {
    return NextResponse.json({ error: "小节不存在或无权访问" }, { status: 404 });
  }

  if (lesson.type !== "image") {
    return NextResponse.json({ error: "此小节不是图片类型" }, { status: 400 });
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

    const { action, urls } = parsed.data;
    let currentImageUrls = lesson.imageUrls || [];

    if (action === "add") {
      if (urls.length === 0) {
        return NextResponse.json({ error: "缺少要添加的图片URL" }, { status: 400 });
      }
      // 添加新URL到数组
      currentImageUrls = [...currentImageUrls, ...urls];
    } else if (action === "remove") {
      if (urls.length === 0) {
        return NextResponse.json({ error: "缺少要删除的图片URL" }, { status: 400 });
      }

      // 从MinIO删除文件：从URL提取key（格式：/uploads/key）
      for (const url of urls) {
        if (url.startsWith('/uploads/')) {
          const key = url.replace('/uploads/', '');
          try {
            await deleteFile(key);
          } catch (error) {
            console.error(`删除MinIO文件失败 ${key}:`, error);
            // 继续执行，不中断
          }
        }
      }

      // 从imageUrls中移除对应的URL
      currentImageUrls = currentImageUrls.filter(url => !urls.includes(url));
    }

    // 更新数据库
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        imageUrls: currentImageUrls,
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (e) {
    console.error("更新图片小节失败:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `更新失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}