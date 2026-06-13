import { z } from "zod";

export const servicesAlignments = ["left", "center", "right", "full"] as const;

export const servicesSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  alignment: z.enum(servicesAlignments).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
      })
    )
    .min(1, "Add at least one service"),
});

export type ServicesContent = z.infer<typeof servicesSchema>;
export type ServicesAlignment = (typeof servicesAlignments)[number];

export const servicesDefaultContent: ServicesContent = {
  heading: "What We Offer",
  alignment: "center",
  items: [
    { title: "Service One", description: "Describe this service." },
    { title: "Service Two", description: "Describe this service." },
    { title: "Service Three", description: "Describe this service." },
  ],
};
