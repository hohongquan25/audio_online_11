"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { createEmailService } from "@/lib/email";
import { generateUserCode } from "@/lib/user-code";
import type { ActionResult } from "@/types";

export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<ActionResult> {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.issues;
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

    // Generate unique code for new user
    let code = generateUserCode();
    let codeExists = await prisma.user.findUnique({ where: { code } });
    
    // Regenerate if code already exists (very rare)
    while (codeExists) {
      code = generateUserCode();
      codeExists = await prisma.user.findUnique({ where: { code } });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: "USER",
        code,
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
  try {
    const { email } = data;

    // Validate email format with zod
    const emailSchema = z.string().email({ message: "Invalid email format" });
    const emailValidation = emailSchema.safeParse(email);
    
    if (!emailValidation.success) {
      // Security: Don't reveal validation errors
      console.log(`[Password Reset] Invalid email format attempted: ${email}`);
      return {
        success: true,
        message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
      };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete old tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } });

      // Save token to DB
      await prisma.passwordResetToken.create({ data: { email, token, expiresAt } });

      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
      
      // Integrate EmailService to send real email
      try {
        const emailService = createEmailService();
        await emailService.sendPasswordResetEmail({
          to: email,
          resetUrl,
          expiryHours: 1,
        });
        
        console.log(`[Password Reset] Success: Email sent to ${email}`);
      } catch (emailError) {
        // Log email sending errors
        console.error('[Password Reset] Email sending failed:', {
          email,
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        
        return {
          success: false,
          message: "Không thể gửi email. Vui lòng thử lại sau.",
        };
      }
    } else {
      // Security: Log for monitoring but don't reveal to user
      console.log(`[Password Reset] Request for non-existent email: ${email}`);
    }

    // Security response: same message regardless of email existence
    return {
      success: true,
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
    };
  } catch (error) {
    // Log unexpected errors
    console.error('[Password Reset] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    return {
      success: false,
      message: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
    };
  }
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
