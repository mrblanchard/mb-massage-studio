import { z } from "zod";

export const contactFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "email", "tel", "textarea", "number"]),
  required: z.boolean(),
});

export const contactSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  body: z.string().optional(),
  fields: z.array(contactFieldSchema).min(1, "At least one field is required"),
  notifyEmail: z
    .union([z.string().email("Enter a valid email address"), z.literal("")])
    .optional(),
});

export type ContactField = z.infer<typeof contactFieldSchema>;
export type ContactContent = z.infer<typeof contactSchema>;

export const contactDefaultContent: ContactContent = {
  heading: "Get in Touch",
  body: "Have a question? Send us a message and we'll get back to you soon.",
  fields: [
    { id: "name", label: "Name", type: "text", required: true },
    { id: "email", label: "Email", type: "email", required: true },
    { id: "phone", label: "Phone (optional)", type: "tel", required: false },
    { id: "message", label: "Message", type: "textarea", required: true },
  ],
};
