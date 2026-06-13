import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";

export type Media = typeof media.$inferSelect;

export async function getAllMedia() {
  return db.query.media.findMany({ orderBy: [desc(media.createdAt)] });
}

export async function getMediaById(id: string): Promise<Media | null> {
  const item = await db.query.media.findFirst({ where: eq(media.id, id) });
  return item ?? null;
}
