import { Resend } from "resend";

// 构建时可能无 env，传占位符避免 Resend 构造函数报错；运行时由 docker-compose 注入真实值
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

const FROM = process.env.RESEND_FROM ?? "零壹 <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "验证你的 零壹 邮箱",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #064e3b;">欢迎加入 零壹</h2>
        <p>你好，${name}！</p>
        <p>请点击下方按钮验证你的邮箱，完成注册：</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #064e3b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">验证邮箱</a>
        </p>
        <p style="color: #64748b; font-size: 14px;">链接 24 小时内有效。若未注册请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">零壹 · 用 AI 帮助普通人成长</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "重置你的 零壹 密码",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #064e3b;">重置密码</h2>
        <p>你好，${name}！</p>
        <p>你请求重置密码，请点击下方按钮设置新密码：</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #064e3b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">重置密码</a>
        </p>
        <p style="color: #64748b; font-size: 14px;">链接 1 小时内有效。若未请求重置请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">零壹 · 用 AI 帮助普通人成长</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }
  return data;
}
