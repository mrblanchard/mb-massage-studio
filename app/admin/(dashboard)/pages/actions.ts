"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { pageFormSchema, type PageFormValues } from "@/lib/pages/schema";

export async function createPage(values: PageFormValues) {
  await requireAuth();

  const parsed = pageFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  const existing = await db.query.pages.findFirst({ where: eq(pages.slug, data.slug) });
  if (existing) {
    return { error: "A page with this slug already exists." };
  }

  const [page] = await db
    .insert(pages)
    .values({
      slug: data.slug,
      title: data.title,
      metaDescription: data.metaDescription || null,
      published: data.published,
    })
    .returning();

  revalidatePath("/admin/pages");
  revalidatePath(`/${data.slug}`);

  return { success: true, id: page.id };
}

export async function updatePage(id: string, values: PageFormValues) {
  await requireAuth();

  const parsed = pageFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  const current = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  if (!current) {
    return { error: "Page not found." };
  }

  // Home page's slug ("") must never change.
  const slug = current.slug === "" ? "" : data.slug;

  const existing = await db.query.pages.findFirst({ where: eq(pages.slug, slug) });
  if (existing && existing.id !== id) {
    return { error: "A page with this slug already exists." };
  }

  await db
    .update(pages)
    .set({
      slug,
      title: data.title,
      metaDescription: data.metaDescription || null,
      published: data.published,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id));

  revalidatePath("/admin/pages");
  revalidatePath(`/${current.slug}`);
  revalidatePath(`/${slug}`);

  return { success: true };
}

export async function deletePage(id: string) {
  await requireAuth();

  const page = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  if (!page) {
    return { error: "Page not found." };
  }
  if (page.slug === "") {
    return { error: "The Home page can't be deleted." };
  }

  await db.delete(pages).where(eq(pages.id, id));

  revalidatePath("/admin/pages");
  revalidatePath(`/${page.slug}`);

  return { success: true };
}
