import { z } from "zod";

export const ctaSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  body: z.string().optional(),
  ctaLabel: z.string().min(1, "Button label is required"),
  ctaHref: z.string().min(1, "Button link is required"),
});

export type CtaContent = z.infer<typeof ctaSchema>;

export const ctaDefaultContent: CtaContent = {
  heading: "Ready to get started?",
  body: "Reach out today and let's talk about how we can help.",
  ctaLabel: "Contact Us",
  ctaHref: "/contact",
};
