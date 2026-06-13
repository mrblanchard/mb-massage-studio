import { z } from "zod";

export const blogListPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  coverImage: z.string().nullable(),
  publishedAt: z.string().nullable(),
});

export const blogListSchema = z.object({
  heading: z.string().optional(),
  limit: z.number().int().min(1).max(12),
  posts: z.array(blogListPostSchema).optional(),
});

export type BlogListPost = z.infer<typeof blogListPostSchema>;
export type BlogListContent = z.infer<typeof blogListSchema>;

export const blogListDefaultContent: BlogListContent = {
  heading: "Latest from the Blog",
  limit: 3,
};
