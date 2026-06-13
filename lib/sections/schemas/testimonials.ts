import { z } from "zod";

export const testimonialsSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  items: z
    .array(
      z.object({
        quote: z.string().min(1, "Quote is required"),
        author: z.string().min(1, "Author is required"),
        role: z.string().optional(),
      })
    )
    .min(1, "Add at least one testimonial"),
});

export type TestimonialsContent = z.infer<typeof testimonialsSchema>;

export const testimonialsDefaultContent: TestimonialsContent = {
  heading: "What Our Customers Say",
  items: [
    {
      quote: "Working with this business was a fantastic experience from start to finish.",
      author: "Jane Doe",
      role: "Happy Customer",
    },
  ],
};
