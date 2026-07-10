import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionList } from "@/components/sections/section-list";
import { getPageBySlug } from "@/lib/db/queries/pages";
import { getSiteSettings } from "@/lib/db/queries/site-settings";
import { resolvePageSections } from "@/lib/sections/resolve-sections";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug(""), getSiteSettings()]);

  if (!page || !page.published) {
    return {};
  }

  const title = page.title || settings?.siteName || "Home";
  const description = page.metaDescription || settings?.tagline || undefined;
  const ogImage = page.ogImage || `/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "/",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function HomePage() {
  const page = await getPageBySlug("");

  if (!page || !page.published) {
    notFound();
  }

  const sections = await resolvePageSections(
    page.sections.map((section) => ({
      id: section.id,
      type: section.type,
      content: section.content,
      backgroundColor: section.backgroundColor,
      styleOverrides: section.styleOverrides,
    }))
  );

  return <SectionList pageId={page.id} sections={sections} />;
}
