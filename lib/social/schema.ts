import { z } from "zod";

export const socialPlatformValues = ["x", "facebook", "instagram", "linkedin"] as const;
export type SocialPlatform = (typeof socialPlatformValues)[number];

export const platformLabels: Record<SocialPlatform, string> = {
  x: "X (Twitter)",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

// Shape submitted to the create/update Server Actions.
export const socialPostInputSchema = z.object({
  content: z.string().min(1, "Post content is required").max(2000),
  mediaUrls: z.array(z.string().min(1)),
  platforms: z.array(z.enum(socialPlatformValues)).min(1, "Select at least one platform"),
  scheduledAt: z.string().optional(),
});

export type SocialPostInput = z.infer<typeof socialPostInputSchema>;

// Shape used by the composer form (mediaUrls as useFieldArray-friendly objects).
export const socialComposerFormSchema = z.object({
  content: z.string().min(1, "Post content is required").max(2000),
  mediaUrls: z.array(z.object({ url: z.string().min(1, "Image is required") })),
  platforms: z.array(z.enum(socialPlatformValues)).min(1, "Select at least one platform"),
  scheduledAt: z.string().optional(),
});

export type SocialComposerFormValues = z.infer<typeof socialComposerFormSchema>;

export const socialComposerDefaultValues: SocialComposerFormValues = {
  content: "",
  mediaUrls: [],
  platforms: [],
  scheduledAt: "",
};
