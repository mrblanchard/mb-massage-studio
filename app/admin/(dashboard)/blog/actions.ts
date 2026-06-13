"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { postFormSchema, type PostFormValues } from "@/lib/blog/schema";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

function revalidateBlogPaths(slugs: string[]) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function createPost(values: PostFormValues) {
  const session = await requireAuth();

  const parsed = postFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  const existing = await db.query.posts.findFirst({ where: eq(posts.slug, data.slug) });
  if (existing) {
    return { error: "A post with this slug already exists." };
  }

  const [post] = await db
    .insert(posts)
    .values({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || null,
      coverImage: data.coverImage || null,
      content: { body: data.body || "" },
      published: data.published,
      publishedAt: data.published ? new Date() : null,
      authorId: session.user.id,
    })
    .returning();

  revalidateBlogPaths([data.slug]);

  return { success: true, id: post.id };
}

export async function updatePost(id: string, values: PostFormValues) {
  await requireAuth();

  const parsed = postFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  const current = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!current) {
    return { error: "Post not found." };
  }

  const existing = await db.query.posts.findFirst({ where: eq(posts.slug, data.slug) });
  if (existing && existing.id !== id) {
    return { error: "A post with this slug already exists." };
  }

  const publishedAt = data.published ? current.publishedAt ?? new Date() : null;

  await db
    .update(posts)
    .set({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || null,
      coverImage: data.coverImage || null,
      content: { body: data.body || "" },
      published: data.published,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));

  revalidateBlogPaths([current.slug, data.slug]);

  return { success: true };
}

export async function deletePost(id: string) {
  await requireAuth();

  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!post) {
    return { error: "Post not found." };
  }

  await db.delete(posts).where(eq(posts.id, id));

  revalidateBlogPaths([post.slug]);

  return { success: true };
}
