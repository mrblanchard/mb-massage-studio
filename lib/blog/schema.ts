import { z } from "zod";

export const postContentSchema = z.object({
  body: z.string().default(""),
});

export type PostContent = z.infer<typeof postContentSchema>;

export const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  body: z.string().optional(),
  published: z.boolean(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export const postFormDefaultValues: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  coverImage: "",
  body: "",
  published: false,
};
