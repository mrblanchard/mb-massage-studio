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
