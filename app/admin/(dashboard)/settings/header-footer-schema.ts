import { z } from "zod";

export const headerSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  logoUrl: z.string().optional(),
  navLinks: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      href: z.string().min(1, "Link is required"),
    })
  ),
  headerCtaLabel: z.string().optional(),
  headerCtaHref: z.string().optional(),
});

export type HeaderSettingsValues = z.infer<typeof headerSettingsSchema>;

export const footerSettingsSchema = z.object({
  tagline: z.string().optional(),
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
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Platform is required"),
      url: z.string().min(1, "URL is required"),
    })
  ),
});

export type FooterSettingsValues = z.infer<typeof footerSettingsSchema>;
