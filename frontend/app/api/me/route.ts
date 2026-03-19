import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// 接受完整 URL 或相对路径（如 /uploads/avatar/xxx.png）
const urlOrPath = z.union([
  z.string().url(),
  z.string().regex(/^\/[a-zA-Z0-9/_.-]+$/, "请输入有效的图片地址"),
]);
const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  role: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.union([urlOrPath, z.literal("")]).optional(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
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
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.role !== undefined) data.role = parsed.data.role || null;
    if (parsed.data.bio !== undefined) data.bio = parsed.data.bio || null;
    if (parsed.data.avatarUrl !== undefined)
      data.avatarUrl = parsed.data.avatarUrl || null;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      bio: user.bio,
    });
  } catch (e) {
    console.error("Update profile error:", e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
