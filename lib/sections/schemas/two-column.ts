import { z } from "zod";

export const twoColumnSchema = z.object({
  heading: z.string().optional(),
  mainContent: z.string().min(1, "Main content is required"),
  sidebarContent: z.string().min(1, "Sidebar content is required"),
  sidebarPosition: z.enum(["left", "right"]),
  mainWidth: z.enum(["60", "70", "75"]),
});

export type TwoColumnContent = z.infer<typeof twoColumnSchema>;

export const twoColumnDefaultContent: TwoColumnContent = {
  heading: "",
  mainContent: "<p>Main content goes here. Use the toolbar to add formatting, links, and lists.</p>",
  sidebarContent: "<p>Sidebar content goes here.</p>",
  sidebarPosition: "right",
  mainWidth: "70",
};
