import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionList } from "@/components/sections/section-list";
import { getPageBySlug } from "@/lib/db/queries/pages";
import { resolvePageSections } from "@/lib/sections/resolve-sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.published) {
    return {};
  }

  const title = page.title;
  const description = page.metaDescription ?? undefined;
  const ogImage = page.ogImage || `/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${slug}`,
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

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.published) {
    notFound();
  }

  const sections = await resolvePageSections(
    page.sections.map((section) => ({
      id: section.id,
      type: section.type,
      content: section.content,
    }))
  );

  return <SectionList pageId={page.id} sections={sections} />;
}
