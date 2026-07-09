import { z } from "zod";

export const aboutSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  body: z.string().min(1, "Body text is required"),
  imageUrl: z.string().optional(),
});

export type AboutContent = z.infer<typeof aboutSchema>;

export const aboutDefaultContent: AboutContent = {
  heading: "About Us",
  body: "<p>Share your story here. Explain who you are, what you offer, and what makes your business different.</p>",
};
