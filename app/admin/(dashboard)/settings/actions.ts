"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

import { siteSettingsSchema, type SiteSettingsFormValues } from "./schema";

function cleanTypography(
  typography: SiteSettingsFormValues["typography"]
): (typeof siteSettings.$inferInsert)["typography"] {
  const cleaned: Record<string, Record<string, unknown>> = {};
  for (const [role, values] of Object.entries(typography ?? {})) {
    if (!values) continue;
    const entry: Record<string, unknown> = {};
    if (values.fontFamily) entry.fontFamily = values.fontFamily;
    if (values.fontSize !== undefined) entry.fontSize = values.fontSize;
    if (values.color) entry.color = values.color;
    if (values.backgroundColor) entry.backgroundColor = values.backgroundColor;
    if (values.fontWeight) entry.fontWeight = values.fontWeight;
    if (values.letterSpacing !== undefined) entry.letterSpacing = values.letterSpacing;
    if (values.lineHeight !== undefined) entry.lineHeight = values.lineHeight;
    if (Object.keys(entry).length > 0) {
      cleaned[role] = entry;
    }
  }
  return cleaned as (typeof siteSettings.$inferInsert)["typography"];
}

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
    baseFontSize: data.baseFontSize || "medium",
    typography: cleanTypography(data.typography),
    contactEmail: data.contactEmail || null,
    cfAnalyticsToken: data.cfAnalyticsToken || null,
    footerColumns: data.footerColumns ?? [],
    navLinks: data.navLinks,
    headerCtaLabel: data.headerCtaLabel || null,
    headerCtaHref: data.headerCtaHref || null,
    enableSidebarNav: data.enableSidebarNav ?? false,
    sidebarNavPosition: data.sidebarNavPosition ?? "left",
    navScrollTransition: data.navScrollTransition ?? "medium",
    headerSticky: data.headerSticky ?? true,
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
