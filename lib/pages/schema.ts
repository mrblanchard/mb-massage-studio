import { z } from "zod";

const RESERVED_SLUGS = ["admin", "blog", "api"];

export const pageFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .regex(/^$|^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only")
    .refine((slug) => !RESERVED_SLUGS.includes(slug), "This slug is reserved"),
  metaDescription: z.string().optional(),
  published: z.boolean(),
});

export type PageFormValues = z.infer<typeof pageFormSchema>;

export const pageFormDefaultValues: PageFormValues = {
  title: "",
  slug: "",
  metaDescription: "",
  published: false,
};
