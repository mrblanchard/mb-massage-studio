"use server";

import { and, desc, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { pages, sections } from "@/lib/db/schema";
import { sectionRegistry } from "@/lib/sections/registry";
import type { SectionContent, SectionType } from "@/lib/sections/types";

async function revalidatePageBySlug(pageId: string) {
  const page = await db.query.pages.findFirst({ where: eq(pages.id, pageId) });
  if (page) {
    revalidatePath(page.slug === "" ? "/" : `/${page.slug}`);
  }
}

export async function updateSectionContent(sectionId: string, content: SectionContent) {
  await requireAuth();

  const section = await db.query.sections.findFirst({ where: eq(sections.id, sectionId) });
  if (!section) {
    return { error: "Section not found." };
  }

  const definition = sectionRegistry[section.type];
  if (!definition) {
    return { error: "Unknown section type." };
  }

  const parsed = definition.schema.safeParse(content);
  if (!parsed.success) {
    return { error: "Invalid section content." };
  }

  await db
    .update(sections)
    .set({ content: parsed.data, updatedAt: new Date() })
    .where(eq(sections.id, sectionId));

  await revalidatePageBySlug(section.pageId);

  return { success: true };
}

export async function addSection(
  pageId: string,
  type: SectionType,
  afterSectionId?: string | null,
  initialContent?: SectionContent,
) {
  await requireAuth();

  const definition = sectionRegistry[type];
  if (!definition) {
    return { error: "Unknown section type." };
  }

  const content = initialContent ?? definition.defaultContent;

  // Append to end (original behavior when afterSectionId is undefined)
  if (afterSectionId === undefined) {
    const lastSection = await db.query.sections.findFirst({
      where: eq(sections.pageId, pageId),
      orderBy: [desc(sections.order)],
    });
    const order = lastSection ? lastSection.order + 1 : 0;

    const [newSection] = await db
      .insert(sections)
      .values({ pageId, type, order, content })
      .returning();

    await revalidatePageBySlug(pageId);
    return { success: true, sectionId: newSection.id };
  }

  // Insert at the beginning
  if (afterSectionId === null) {
    await db.transaction(async (tx) => {
      await tx
        .update(sections)
        .set({ order: sql`${sections.order} + 1`, updatedAt: new Date() })
        .where(eq(sections.pageId, pageId));

      await tx.insert(sections).values({ pageId, type, order: 0, content });
    });

    await revalidatePageBySlug(pageId);
    return { success: true };
  }

  // Insert after a specific section
  const target = await db.query.sections.findFirst({
    where: eq(sections.id, afterSectionId),
  });
  if (!target) {
    return { error: "Target section not found." };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(sections)
      .set({ order: sql`${sections.order} + 1`, updatedAt: new Date() })
      .where(and(eq(sections.pageId, pageId), gt(sections.order, target.order)));

    await tx.insert(sections).values({ pageId, type, order: target.order + 1, content });
  });

  await revalidatePageBySlug(pageId);
  return { success: true };
}

export async function deleteSection(sectionId: string) {
  await requireAuth();

  const section = await db.query.sections.findFirst({ where: eq(sections.id, sectionId) });
  if (!section) {
    return { error: "Section not found." };
  }

  await db.delete(sections).where(eq(sections.id, sectionId));

  await revalidatePageBySlug(section.pageId);

  return { success: true };
}

export async function reorderSections(pageId: string, orderedIds: string[]) {
  await requireAuth();

  await db.transaction(async (tx) => {
    for (let index = 0; index < orderedIds.length; index++) {
      await tx
        .update(sections)
        .set({ order: index, updatedAt: new Date() })
        .where(eq(sections.id, orderedIds[index]));
    }
  });

  await revalidatePageBySlug(pageId);

  return { success: true };
}
