"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return !!(session?.user && session.user.role === "ADMIN");
}

export async function toggleBanUser(userId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "User không tồn tại" };
    if (user.role === "ADMIN") return { success: false, message: "Không thể chặn admin" };

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });

    revalidatePath("/admin/users");
    return { success: true, message: user.isBanned ? "Đã bỏ chặn user" : "Đã chặn user" };
  } catch (error) {
    console.error("Error toggling ban:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function cancelUserVip(userId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "User không tồn tại" };
    if (user.role !== "VIP") return { success: false, message: "User không phải VIP" };

    await prisma.user.update({
      where: { id: userId },
      data: { role: "USER", vipExpiredAt: null },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "Đã hủy VIP của user" };
  } catch (error) {
    console.error("Error canceling VIP:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function grantUserVip(userId: string, planId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "User không tồn tại" };

    const plan = await prisma.vipPlan.findUnique({ where: { id: planId } });
    if (!plan) return { success: false, message: "Gói VIP không hợp lệ" };

    const vipExpiredAt = new Date();
    vipExpiredAt.setDate(vipExpiredAt.getDate() + plan.days);

    await prisma.user.update({
      where: { id: userId },
      data: { role: "VIP", vipExpiredAt },
    });

    revalidatePath("/admin/users");
    return { success: true, message: `Đã cấp ${plan.name} (${plan.days} ngày) cho user` };
  } catch (error) {
    console.error("Error granting VIP:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}
