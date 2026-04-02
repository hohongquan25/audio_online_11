"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return !!(session?.user && session.user.role === "ADMIN");
}

export async function createVipPlan(data: { name: string; days: number; price: number; description: string; sortOrder: number }): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };
  try {
    await prisma.vipPlan.create({ data });
    revalidatePath("/admin/vip-plans");
    revalidatePath("/vip");
    return { success: true, message: "Đã tạo gói VIP" };
  } catch (e) { console.error(e); return { success: false, message: "Lỗi" }; }
}

export async function updateVipPlan(id: string, data: { name?: string; days?: number; price?: number; description?: string; isActive?: boolean; sortOrder?: number }): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };
  try {
    await prisma.vipPlan.update({ where: { id }, data });
    revalidatePath("/admin/vip-plans");
    revalidatePath("/vip");
    return { success: true, message: "Đã cập nhật" };
  } catch (e) { console.error(e); return { success: false, message: "Lỗi" }; }
}

export async function deleteVipPlan(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };
  try {
    await prisma.vipPlan.delete({ where: { id } });
    revalidatePath("/admin/vip-plans");
    revalidatePath("/vip");
    return { success: true, message: "Đã xóa" };
  } catch (e) { console.error(e); return { success: false, message: "Lỗi" }; }
}
