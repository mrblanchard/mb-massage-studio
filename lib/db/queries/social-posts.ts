import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { socialPosts } from "@/lib/db/schema";

export type SocialPost = typeof socialPosts.$inferSelect;

export async function getSocialPosts() {
  return db.query.socialPosts.findMany({ orderBy: [desc(socialPosts.createdAt)] });
}

export async function getSocialPostById(id: string): Promise<SocialPost | null> {
  const post = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, id) });
  return post ?? null;
}
