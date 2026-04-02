"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { storyCreateSchema, episodeCreateSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session.user.id;
}

export async function createStory(data: {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  isVip: boolean;
  categoryId?: string;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  const parsed = storyCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dữ liệu không hợp lệ" };
  }

  try {
    const story = await prisma.story.create({
      data: { ...parsed.data, categoryId: data.categoryId || null },
    });
    revalidatePath("/admin/stories");
    revalidatePath("/stories");
    return { success: true, message: "Đã tạo truyện", data: { storyId: story.id, slug: story.slug } };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return { success: false, message: "Slug đã tồn tại" };
    }
    console.error("Error creating story:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function updateStory(storyId: string, data: {
  title?: string;
  description?: string;
  coverImage?: string;
  isVip?: boolean;
  isActive?: boolean;
  categoryId?: string | null;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    await prisma.story.update({ where: { id: storyId }, data });
    revalidatePath("/admin/stories");
    revalidatePath("/stories");
    revalidatePath("/");
    return { success: true, message: "Đã cập nhật truyện" };
  } catch (error) {
    console.error("Error updating story:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function toggleStoryActive(storyId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return { success: false, message: "Truyện không tồn tại" };

    await prisma.story.update({
      where: { id: storyId },
      data: { isActive: !story.isActive },
    });
    revalidatePath("/admin/stories");
    revalidatePath("/stories");
    revalidatePath("/");
    return { success: true, message: story.isActive ? "Đã tắt truyện" : "Đã bật truyện" };
  } catch (error) {
    console.error("Error toggling story:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function deleteStory(storyId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    await prisma.story.delete({ where: { id: storyId } });
    revalidatePath("/admin/stories");
    revalidatePath("/stories");
    revalidatePath("/");
    return { success: true, message: "Đã xóa truyện" };
  } catch (error) {
    console.error("Error deleting story:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function createEpisode(storyId: string, data: {
  title: string; audioUrl: string; order: number; duration: number; isFreePreview: boolean;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  const parsed = episodeCreateSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dữ liệu không hợp lệ" };

  try {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return { success: false, message: "Truyện không tồn tại" };

    const episode = await prisma.episode.create({ data: { ...parsed.data, storyId } });
    revalidatePath("/admin/stories");
    revalidatePath(`/stories/${story.slug}`);
    return { success: true, message: "Đã thêm tập", data: { episodeId: episode.id } };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return { success: false, message: "Thứ tự tập đã tồn tại" };
    }
    console.error("Error creating episode:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function updateEpisode(episodeId: string, data: {
  title?: string; audioUrl?: string; order?: number; duration?: number; isFreePreview?: boolean;
}): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    const episode = await prisma.episode.update({ where: { id: episodeId }, data });
    revalidatePath("/admin/stories");
    return { success: true, message: "Đã cập nhật tập" };
  } catch (error) {
    console.error("Error updating episode:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function deleteEpisode(episodeId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    await prisma.episode.delete({ where: { id: episodeId } });
    revalidatePath("/admin/stories");
    return { success: true, message: "Đã xóa tập" };
  } catch (error) {
    console.error("Error deleting episode:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

// Category actions
export async function createCategory(data: { name: string; slug: string; emoji: string }): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    const cat = await prisma.category.create({ data });
    revalidatePath("/admin/categories");
    return { success: true, message: "Đã tạo danh mục", data: { categoryId: cat.id } };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return { success: false, message: "Danh mục đã tồn tại" };
    }
    console.error("Error creating category:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, message: "Không có quyền" };

  try {
    await prisma.story.updateMany({ where: { categoryId }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin/categories");
    return { success: true, message: "Đã xóa danh mục" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: "Đã xảy ra lỗi" };
  }
}
