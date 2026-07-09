import { z } from "zod";

export const heroSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  imageUrl: z.string().optional(),
  layout: z.enum(["side", "overlay"]).optional(),
  logoUrl: z.string().optional(),
  logoSize: z.enum(["small", "medium", "large", "xlarge"]).optional(),
  overlayDarkness: z.enum(["light", "medium", "dark"]).optional(),
  hideTextVisually: z.boolean().optional(),
});

export type HeroContent = z.infer<typeof heroSchema>;

export const heroDefaultContent: HeroContent = {
  heading: "Welcome to Your Business",
  subheading: "Tell visitors what you do and why it matters.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
  layout: "side",
};
