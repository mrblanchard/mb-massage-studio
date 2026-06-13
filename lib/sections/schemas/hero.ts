import { z } from "zod";

export const heroSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type HeroContent = z.infer<typeof heroSchema>;

export const heroDefaultContent: HeroContent = {
  heading: "Welcome to Your Business",
  subheading: "Tell visitors what you do and why it matters.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
};
