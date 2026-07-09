import { z } from "zod";

export const richTextSchema = z.object({
  heading: z.string().optional(),
  body: z.string().min(1, "Body text is required"),
});

export type RichTextContent = z.infer<typeof richTextSchema>;

export const richTextDefaultContent: RichTextContent = {
  heading: "",
  body: "<p>Write your content here. Use the toolbar to add formatting like bold text, links, and lists.</p>",
};
