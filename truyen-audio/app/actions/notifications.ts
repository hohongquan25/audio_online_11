"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return !!(session?.user && session.user.role === "ADMIN");
}

export async function createNotification(data: { title: string; content: string }): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };
  try {
    await prisma.notification.create({ data });
    revalidatePath("/admin/notifications");
    return { success: true, message: "Đã tạo thông báo" };
  } catch (e) { console.error(e); return { success: false, message: "Lỗi" }; }
}

export async function updateNotification(id: string, data: { title?: string; content?: string; isActive?: boolean }): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };
  try {
    await prisma.notification.update({ where: { id }, data });
    revalidatePath("/admin/notifications");
    return { success: true, message: "Đã cập nhật" };
  } catch (e) { console.error(e); return { success: false, message: "Lỗi" }; }
}

export async function deleteNotification(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };
  try {
    await prisma.notification.delete({ where: { id } });
    revalidatePath("/admin/notifications");
    return { success: true, message: "Đã xóa" };
  } catch (e) { console.error(e); return { success: false, message: "Lỗi" }; }
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Chưa đăng nhập" };
  try {
    await prisma.notificationRead.upsert({
      where: { userId_notificationId: { userId: session.user.id, notificationId } },
      update: {},
      create: { userId: session.user.id, notificationId },
    });
    return { success: true, message: "OK" };
  } catch (e) { console.error(e); return { success: false, message: "Lỗi" }; }
}
