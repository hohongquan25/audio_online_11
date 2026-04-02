"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function toggleFavorite(storyId: string): Promise<ActionResult & { isFavorite?: boolean }> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Vui lòng đăng nhập" };

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_storyId: { userId: session.user.id, storyId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      revalidatePath("/profile");
      return { success: true, message: "Đã bỏ theo dõi", isFavorite: false };
    } else {
      await prisma.favorite.create({ data: { userId: session.user.id, storyId } });
      revalidatePath("/profile");
      return { success: true, message: "Đã theo dõi truyện", isFavorite: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function incrementViewCount(storyId: string): Promise<void> {
  try {
    await prisma.story.update({
      where: { id: storyId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Silently fail
  }
}
