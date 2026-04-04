"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import { generateTransferContent } from "@/lib/user-code";

// Create a PENDING payment only when user confirms transfer
export async function createPendingPayment(planId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Vui lòng đăng nhập" };

  try {
    const plan = await prisma.vipPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) return { success: false, message: "Gói VIP không hợp lệ" };

    const userCode = session.user.code || "";
    const transferContent = userCode ? generateTransferContent(userCode, plan.name) : "";

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        plan: "MONTH",
        amount: plan.price,
        status: "PENDING",
        planName: plan.name,
        days: plan.days,
        note: `Nội dung CK: ${transferContent} - Chờ admin duyệt`,
      },
    });

    return { success: true, message: "Đã ghi nhận! Admin sẽ xác nhận và cấp VIP cho bạn sớm.", data: { paymentId: payment.id } };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

// User confirms they have transferred
export async function confirmPaymentTransfer(paymentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Vui lòng đăng nhập" };

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.userId !== session.user.id) return { success: false, message: "Không tìm thấy giao dịch" };
    if (payment.status !== "PENDING") return { success: false, message: "Giao dịch đã được xử lý" };

    await prisma.payment.update({
      where: { id: paymentId },
      data: { note: "Người dùng đã xác nhận chuyển khoản - chờ admin duyệt" },
    });

    return { success: true, message: "Đã ghi nhận! Admin sẽ xác nhận và cấp VIP cho bạn sớm." };
  } catch (error) {
    console.error("Error confirming payment:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

// Admin approves payment and grants VIP
export async function approvePayment(paymentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { success: false, message: "Không có quyền" };

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return { success: false, message: "Không tìm thấy giao dịch" };

    const vipExpiredAt = new Date();
    vipExpiredAt.setDate(vipExpiredAt.getDate() + (payment.days || 30));

    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: "SUCCESS" } }),
      prisma.user.update({ where: { id: payment.userId }, data: { role: "VIP", vipExpiredAt } }),
    ]);

    revalidatePath("/admin/users");
    return { success: true, message: "Đã duyệt và cấp VIP" };
  } catch (error) {
    console.error("Error approving payment:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}
