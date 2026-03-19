import { prisma } from "./prisma";

export async function verifyToken(token: string): Promise<
  | { success: true }
  | { success: false; error: "invalid" | "expired" }
> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) return { success: false, error: "invalid" };
  if (record.expiresAt < new Date()) return { success: false, error: "expired" };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return { success: true };
}
