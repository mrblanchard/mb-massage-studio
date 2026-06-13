import { z } from "zod";

export const richTextSchema = z.object({
  heading: z.string().optional(),
  body: z.string().min(1, "Body text is required"),
});

export type RichTextContent = z.infer<typeof richTextSchema>;

export const richTextDefaultContent: RichTextContent = {
  heading: "",
  body: "Write your content here. Separate paragraphs with a blank line.",
};
