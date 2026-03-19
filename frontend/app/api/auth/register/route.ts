import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/resend";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
  name: z.string().min(1, "请输入昵称").max(50),
  turnstileToken: z.string().optional(),
  website: z.string().optional(), // 蜜罐：人类留空，机器人会填
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

    // 蜜罐：该字段有值则判定为机器人，直接拒绝
    if (body.website?.trim()) {
      return NextResponse.json({ error: "注册失败" }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "参数错误" },
        { status: 400 }
      );
    }

    const { email, password, name, turnstileToken } = parsed.data;

    // Turnstile 人机验证（若已配置）
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "请完成人机验证" },
          { status: 400 }
        );
      }
      const { verifyTurnstileToken } = await import("@/lib/turnstile");
      const turnstileValid = await verifyTurnstileToken(turnstileToken);
      if (!turnstileValid) {
        return NextResponse.json(
          { error: "人机验证失败，请刷新页面重试" },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 小时

    await prisma.verificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await sendVerificationEmail(email, name, token);

    return NextResponse.json({
      success: true,
      message: "注册成功，请查收验证邮件",
    });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
