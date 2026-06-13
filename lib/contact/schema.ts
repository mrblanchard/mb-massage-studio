import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(50).optional(),
  message: z.string().min(1, "Message is required").max(5000),
  // Honeypot field - real visitors never fill this in. Hidden via CSS.
  company: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactFormDefaultValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
  company: "",
};
