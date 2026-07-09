import { z } from "zod";

import { typographySchema } from "@/lib/theme/typography-schema";

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  tagline: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional(),
  baseFontSize: z.enum(["small", "medium", "large"]).optional(),
  typography: typographySchema.optional(),
  contactEmail: z
    .union([z.string().email("Enter a valid email address"), z.literal("")])
    .optional(),
  cfAnalyticsToken: z.string().optional(),
  navLinks: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      href: z.string().min(1, "Link is required"),
    })
  ),
  headerCtaLabel: z.string().optional(),
  headerCtaHref: z.string().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Platform is required"),
      url: z.string().min(1, "URL is required"),
    })
  ),
  businessInfo: z.object({
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    hours: z.string().optional(),
  }),
  footerColumns: z.array(
    z.object({
      heading: z.string().optional(),
      body: z.string().optional(),
      links: z.array(
        z.object({
          label: z.string().min(1, "Label is required"),
          href: z.string().min(1, "Link is required"),
        })
      ),
    })
  ),
  enableSidebarNav: z.boolean(),
  sidebarNavPosition: z.enum(["left", "right"]),
  navScrollTransition: z.enum(["off", "slow", "semiSlow", "medium", "fast"]).optional(),
  headerSticky: z.boolean(),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;
