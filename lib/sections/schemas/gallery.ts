import { z } from "zod";

export const galleryImageSchema = z.object({
  url: z.string().min(1, "Image is required"),
  caption: z.string().optional(),
});

export const gallerySchema = z.object({
  heading: z.string().optional(),
  images: z.array(galleryImageSchema),
});

export type GalleryImage = z.infer<typeof galleryImageSchema>;
export type GalleryContent = z.infer<typeof gallerySchema>;

export const galleryDefaultContent: GalleryContent = {
  heading: "Gallery",
  images: [],
};
