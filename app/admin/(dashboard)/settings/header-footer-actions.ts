"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

import {
  footerSettingsSchema,
  headerSettingsSchema,
  type FooterSettingsValues,
  type HeaderSettingsValues,
} from "./header-footer-schema";

export async function updateHeaderSettings(values: HeaderSettingsValues) {
  await requireAuth();

  const parsed = headerSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  await db
    .update(siteSettings)
    .set({
      siteName: data.siteName,
      logoUrl: data.logoUrl || null,
      navLinks: data.navLinks,
      headerCtaLabel: data.headerCtaLabel || null,
      headerCtaHref: data.headerCtaHref || null,
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, 1));

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { success: true };
}

export async function updateFooterSettings(values: FooterSettingsValues) {
  await requireAuth();

  const parsed = footerSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  await db
    .update(siteSettings)
    .set({
      tagline: data.tagline || null,
      businessInfo: data.businessInfo,
      footerColumns: data.footerColumns,
      socialLinks: Object.fromEntries(data.socialLinks.map((link) => [link.platform, link.url])),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, 1));

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { success: true };
}
