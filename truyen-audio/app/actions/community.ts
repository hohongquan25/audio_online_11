"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { postSchema, commentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createPost(content: string, type: string = "general"): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Vui lòng đăng nhập" };
  }

  const parsed = postSchema.safeParse({ content });
  if (!parsed.success) {
    const firstError = parsed.error.flatten().formErrors[0]
      ?? Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return {
      success: false,
      message: firstError ?? "Nội dung không hợp lệ",
    };
  }

  try {
    const post = await prisma.post.create({
      data: {
        content: parsed.data.content,
        type: ["general", "feedback", "bug"].includes(type) ? type : "general",
        authorId: session.user.id,
      },
    });

    revalidatePath("/community");
    return {
      success: true,
      message: "Đã tạo bài viết",
      data: { postId: post.id },
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, message: "Đã xảy ra lỗi, vui lòng thử lại" };
  }
}

export async function createComment(
  postId: string,
  content: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Vui lòng đăng nhập" };
  }

  const parsed = commentSchema.safeParse({ content });
  if (!parsed.success) {
    const firstError = parsed.error.flatten().formErrors[0]
      ?? Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return {
      success: false,
      message: firstError ?? "Bình luận không hợp lệ",
    };
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return { success: false, message: "Bài viết không tồn tại" };
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        postId,
        authorId: session.user.id,
      },
    });

    revalidatePath("/community");
    return {
      success: true,
      message: "Đã thêm bình luận",
      data: { commentId: comment.id },
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, message: "Đã xảy ra lỗi, vui lòng thử lại" };
  }
}

export async function toggleLike(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Vui lòng đăng nhập" };
  }

  try {
    const result = await prisma.$transaction(async (tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
      const existingLike = await tx.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });

      if (existingLike) {
        await tx.like.delete({
          where: { id: existingLike.id },
        });
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        });
        return { liked: false };
      } else {
        await tx.like.create({
          data: {
            userId: session.user.id,
            postId,
          },
        });
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        });
        return { liked: true };
      }
    });

    revalidatePath("/community");
    return {
      success: true,
      message: result.liked ? "Đã thích bài viết" : "Đã bỏ thích bài viết",
      data: result,
    };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, message: "Đã xảy ra lỗi, vui lòng thử lại" };
  }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Vui lòng đăng nhập" };
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return { success: false, message: "Bài viết không tồn tại" };
    }

    if (post.authorId !== session.user.id) {
      return { success: false, message: "Bạn không có quyền xóa bài viết này" };
    }

    await prisma.post.delete({ where: { id: postId } });

    revalidatePath("/community");
    return { success: true, message: "Đã xóa bài viết" };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, message: "Đã xảy ra lỗi, vui lòng thử lại" };
  }
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Vui lòng đăng nhập" };
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return { success: false, message: "Bình luận không tồn tại" };
    }

    if (comment.authorId !== session.user.id) {
      return { success: false, message: "Bạn không có quyền xóa bình luận này" };
    }

    await prisma.comment.delete({ where: { id: commentId } });

    revalidatePath("/community");
    return { success: true, message: "Đã xóa bình luận" };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, message: "Đã xảy ra lỗi, vui lòng thử lại" };
  }
}
