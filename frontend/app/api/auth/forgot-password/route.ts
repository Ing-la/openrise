import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/resend";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("请输入有效的邮箱"),
});

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "邮件服务未配置，请联系管理员" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    // 无论用户是否存在都返回成功，防止邮箱枚举
    if (!user) {
      return NextResponse.json({ success: true, message: "若该邮箱已注册，将收到重置链接" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 小时

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await sendPasswordResetEmail(email, user.name ?? "用户", token);

    return NextResponse.json({ success: true, message: "若该邮箱已注册，将收到重置链接" });
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: "请求失败，请稍后重试" }, { status: 500 });
  }
}
