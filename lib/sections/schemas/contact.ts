import { z } from "zod";

export const contactSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  body: z.string().optional(),
});

export type ContactContent = z.infer<typeof contactSchema>;

export const contactDefaultContent: ContactContent = {
  heading: "Get in Touch",
  body: "Have a question? Send us a message and we'll get back to you soon.",
};
