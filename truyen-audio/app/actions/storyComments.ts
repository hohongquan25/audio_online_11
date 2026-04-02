"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function addStoryComment(storyId: string, content: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Vui lòng đăng nhập" };
  if (!content.trim() || content.length > 2000) return { success: false, message: "Nội dung không hợp lệ" };

  try {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return { success: false, message: "Truyện không tồn tại" };

    await prisma.storyComment.create({
      data: { content: content.trim(), storyId, authorId: session.user.id },
    });

    revalidatePath(`/stories/${story.slug}`);
    return { success: true, message: "Đã thêm bình luận" };
  } catch (error) {
    console.error("Error adding story comment:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function deleteStoryComment(commentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Vui lòng đăng nhập" };

  try {
    const comment = await prisma.storyComment.findUnique({ where: { id: commentId }, include: { story: true } });
    if (!comment) return { success: false, message: "Bình luận không tồn tại" };
    if (comment.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, message: "Không có quyền xóa" };
    }

    await prisma.storyComment.delete({ where: { id: commentId } });
    revalidatePath(`/stories/${comment.story.slug}`);
    return { success: true, message: "Đã xóa bình luận" };
  } catch (error) {
    console.error("Error deleting story comment:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}
