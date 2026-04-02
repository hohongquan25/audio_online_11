"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function saveProgress(
  episodeId: string,
  progressSeconds: number
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Vui lòng đăng nhập" };
  }

  if (!episodeId || typeof progressSeconds !== "number" || progressSeconds < 0) {
    return { success: false, message: "Dữ liệu không hợp lệ" };
  }

  try {
    await prisma.listeningHistory.upsert({
      where: {
        userId_episodeId: {
          userId: session.user.id,
          episodeId,
        },
      },
      update: { progressSeconds },
      create: {
        userId: session.user.id,
        episodeId,
        progressSeconds,
      },
    });

    return { success: true, message: "Đã lưu tiến trình" };
  } catch (error) {
    console.error("Error saving progress:", error);
    return { success: false, message: "Đã xảy ra lỗi, vui lòng thử lại" };
  }
}

export async function getProgress(
  episodeId: string
): Promise<number | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  try {
    const history = await prisma.listeningHistory.findUnique({
      where: {
        userId_episodeId: {
          userId: session.user.id,
          episodeId,
        },
      },
    });

    return history?.progressSeconds ?? null;
  } catch (error) {
    console.error("Error getting progress:", error);
    return null;
  }
}
