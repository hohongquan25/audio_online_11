"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "default" } });
  }
  return settings;
}

export async function updateSiteSettings(data: {
  heroBackground?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
  }

  try {
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });

    revalidatePath("/");
    return { success: true, message: "Đã cập nhật cài đặt trang" };
  } catch (error) {
    console.error("Error updating site settings:", error);
    return { success: false, message: "Đã xảy ra lỗi, vui lòng thử lại" };
  }
}
