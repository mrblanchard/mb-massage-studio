"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { socialPosts } from "@/lib/db/schema";
import { socialPostInputSchema, type SocialPostInput } from "@/lib/social/schema";

export async function createSocialPost(values: SocialPostInput) {
  await requireAuth();

  const parsed = socialPostInputSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

  const [post] = await db
    .insert(socialPosts)
    .values({
      content: data.content,
      mediaUrls: data.mediaUrls,
      platforms: data.platforms,
      scheduledAt,
      status: scheduledAt ? "scheduled" : "draft",
    })
    .returning();

  revalidatePath("/admin/social");

  return { success: true, id: post.id };
}

export async function updateSocialPost(id: string, values: SocialPostInput) {
  await requireAuth();

  const parsed = socialPostInputSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  const current = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, id) });
  if (!current) {
    return { error: "Post not found." };
  }

  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
  const status =
    current.status === "posted" || current.status === "failed"
      ? current.status
      : scheduledAt
        ? "scheduled"
        : "draft";

  await db
    .update(socialPosts)
    .set({
      content: data.content,
      mediaUrls: data.mediaUrls,
      platforms: data.platforms,
      scheduledAt,
      status,
    })
    .where(eq(socialPosts.id, id));

  revalidatePath("/admin/social");

  return { success: true };
}

export async function deleteSocialPost(id: string) {
  await requireAuth();

  const post = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, id) });
  if (!post) {
    return { error: "Post not found." };
  }

  await db.delete(socialPosts).where(eq(socialPosts.id, id));

  revalidatePath("/admin/social");

  return { success: true };
}
