"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

import { siteSettingsSchema, type SiteSettingsFormValues } from "./schema";

export async function updateSiteSettings(values: SiteSettingsFormValues) {
  await requireAuth();

  const parsed = siteSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  const record = {
    siteName: data.siteName,
    tagline: data.tagline || null,
    logoUrl: data.logoUrl || null,
    faviconUrl: data.faviconUrl || null,
    primaryColor: data.primaryColor || null,
    secondaryColor: data.secondaryColor || null,
    fontHeading: data.fontHeading || null,
    fontBody: data.fontBody || null,
    contactEmail: data.contactEmail || null,
    cfAnalyticsToken: data.cfAnalyticsToken || null,
    navLinks: data.navLinks,
    socialLinks: Object.fromEntries(
      data.socialLinks.map((link) => [link.platform, link.url])
    ),
    businessInfo: data.businessInfo,
    updatedAt: new Date(),
  };

  await db
    .insert(siteSettings)
    .values({ id: 1, ...record })
    .onConflictDoUpdate({ target: siteSettings.id, set: record });

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { success: true };
}
