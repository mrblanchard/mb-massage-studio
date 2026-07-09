import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { pages, sections } from "@/lib/db/schema";

export type PageWithSections = typeof pages.$inferSelect & {
  sections: (typeof sections.$inferSelect)[];
};

export async function getPageBySlug(slug: string): Promise<PageWithSections | null> {
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
    with: {
      sections: {
        orderBy: [asc(sections.order)],
      },
    },
  });

  return page ?? null;
}

export type Page = typeof pages.$inferSelect;

export async function getPageById(id: string): Promise<Page | null> {
  const page = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  return page ?? null;
}

export async function getAllPages(): Promise<Page[]> {
  return db.query.pages.findMany({ orderBy: [asc(pages.createdAt)] });
}
