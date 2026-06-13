import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export type SiteSettings = typeof siteSettings.$inferSelect;

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const settings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, 1),
  });

  return settings ?? null;
}
