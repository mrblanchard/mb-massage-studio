"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { styleSettingsSchema, type StyleSettingsValues } from "@/lib/theme/typography-schema";

function cleanTypography(
  typography: StyleSettingsValues["typography"]
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

export async function updateTypographySettings(values: StyleSettingsValues) {
  await requireAuth();

  const parsed = styleSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  await db
    .update(siteSettings)
    .set({
      fontHeading: data.fontHeading,
      fontBody: data.fontBody,
      baseFontSize: data.baseFontSize,
      typography: cleanTypography(data.typography),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, 1));

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { success: true };
}
