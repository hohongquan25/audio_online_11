"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

// In-memory store for password reset tokens (mock)
// Maps token → { email, expiresAt }
const resetTokens = new Map<string, { email: string; expiresAt: Date }>();

export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<ActionResult> {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.issues ?? parsed.error.errors ?? [];
      const firstError = (errors[0] as { message?: string })?.message ?? "Dữ liệu không hợp lệ";
      return { success: false, message: firstError };
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "Email đã được sử dụng" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: "USER",
      },
    });

    return {
      success: true,
      message: "Đăng ký thành công",
      data: { userId: user.id },
    };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "Đã xảy ra lỗi khi đăng ký, vui lòng thử lại" };
  }
}

export async function requestPasswordReset(data: {
  email: string;
}): Promise<ActionResult> {
  const { email } = data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete old tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Save token to DB
    await prisma.passwordResetToken.create({ data: { email, token, expiresAt } });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    console.log(`[Password Reset] Link for ${email}: ${resetUrl}`);
  }

  return {
    success: true,
    message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
  };
}

export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<ActionResult> {
  const { token, password } = data;

  if (password.length < 6) {
    return { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  const tokenData = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!tokenData) {
    return { success: false, message: "Token không hợp lệ hoặc đã hết hạn" };
  }

  if (tokenData.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return { success: false, message: "Token không hợp lệ hoặc đã hết hạn" };
  }

  const user = await prisma.user.findUnique({ where: { email: tokenData.email } });

  if (!user) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return { success: false, message: "Token không hợp lệ hoặc đã hết hạn" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return {
    success: true,
    message: "Mật khẩu đã được đặt lại thành công",
  };
}
