import { getSiteSettings } from "@/lib/db/queries/site-settings";
import { getPublishedPosts } from "@/lib/db/queries/posts";
import { generateQrDataUrl } from "@/lib/payments/qr";
import { columnsSchema } from "@/lib/sections/schemas/columns";
import { blogListDefaultContent, blogListSchema, type BlogListPost } from "@/lib/sections/schemas/blog-list";
import type { SectionContent, SectionType } from "@/lib/sections/types";

export interface RawSection {
  id: string;
  type: SectionType;
  content: SectionContent;
  backgroundColor: string | null;
}

function paypalPaymentUrl(hostedButtonId: string) {
  return `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${encodeURIComponent(hostedButtonId)}`;
}

export async function resolvePageSections(sections: RawSection[]): Promise<RawSection[]> {
  let accentColorPromise: Promise<string> | null = null;
  const getAccentColor = () => {
    if (!accentColorPromise) {
      accentColorPromise = getSiteSettings().then(
        (settings) =>
          settings?.typography?.button?.backgroundColor || settings?.primaryColor || "#171717",
      );
    }
    return accentColorPromise;
  };

  return Promise.all(
    sections.map(async (section) => {
      if (section.type === "blog_list") {
        const parsed = blogListSchema.safeParse(section.content);
        const limit = parsed.success ? parsed.data.limit : blogListDefaultContent.limit;
        const posts = await getPublishedPosts(limit);

        const blogPosts: BlogListPost[] = posts.map((post) => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        }));

        return {
          ...section,
          content: { ...section.content, posts: blogPosts },
        };
      }

      if (section.type === "columns") {
        const parsed = columnsSchema.safeParse(section.content);
        if (!parsed.success) {
          return section;
        }

        const accentColor = await getAccentColor();
        const columns = await Promise.all(
          parsed.data.columns.map(async (column) => ({
            ...column,
            payPalQr: column.payPalButton
              ? await generateQrDataUrl(
                  paypalPaymentUrl(column.payPalButton.hostedButtonId),
                  accentColor,
                )
              : null,
            venmoQr: column.venmoButton
              ? await generateQrDataUrl(`https://venmo.com/u/${column.venmoButton.handle}`, accentColor)
              : null,
            squareQr: column.squareButton
              ? await generateQrDataUrl(column.squareButton.checkoutUrl, accentColor)
              : null,
          })),
        );

        return {
          ...section,
          content: { ...section.content, columns },
        };
      }

      return section;
    })
  );
}
