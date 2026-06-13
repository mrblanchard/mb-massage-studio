import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

export type Post = typeof posts.$inferSelect;

export async function getPublishedPosts(limit?: number) {
  return db.query.posts.findMany({
    where: eq(posts.published, true),
    orderBy: [desc(posts.publishedAt)],
    limit,
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  return post ?? null;
}

export async function getPostById(id: string): Promise<Post | null> {
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  return post ?? null;
}

export async function getAllPosts() {
  return db.query.posts.findMany({ orderBy: [desc(posts.createdAt)] });
}
