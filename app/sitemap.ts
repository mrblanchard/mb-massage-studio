import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { getPublishedPosts } from "@/lib/db/queries/posts";
import { pages } from "@/lib/db/schema";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [publishedPages, posts] = await Promise.all([
    db.query.pages.findMany({ where: eq(pages.published, true) }),
    getPublishedPosts(),
  ]);

  const pageEntries: MetadataRoute.Sitemap = publishedPages.map((page) => ({
    url: page.slug === "" ? siteUrl : `${siteUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "monthly",
    priority: page.slug === "" ? 1 : 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap =
    posts.length > 0
      ? [
          { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.6 },
          ...posts.map((post) => ({
            url: `${siteUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.5,
          })),
        ]
      : [];

  return [...pageEntries, ...postEntries];
}
