import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const storyFilterSchema = z.object({
  genre: z.string().optional(),
  status: z.enum(["all", "free", "vip"]).default("all"),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export const postSchema = z.object({
  content: z.string().min(1, "Nội dung không được để trống").max(5000),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Bình luận không được để trống").max(2000),
});

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
});

export const storyCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  coverImage: z.string().url(),
  isVip: z.boolean().default(false),
});

export const episodeCreateSchema = z.object({
  title: z.string().min(1),
  audioUrl: z.string().url(),
  order: z.number().int().positive(),
  duration: z.number().int().positive(),
  isFreePreview: z.boolean().default(false),
});

// Inferred types for convenience
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StoryFilterInput = z.infer<typeof storyFilterSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type StoryCreateInput = z.infer<typeof storyCreateSchema>;
export type EpisodeCreateInput = z.infer<typeof episodeCreateSchema>;
