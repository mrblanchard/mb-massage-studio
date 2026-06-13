import { getPublishedPosts } from "@/lib/db/queries/posts";
import { blogListDefaultContent, blogListSchema, type BlogListPost } from "@/lib/sections/schemas/blog-list";
import type { SectionContent, SectionType } from "@/lib/sections/types";

export interface RawSection {
  id: string;
  type: SectionType;
  content: SectionContent;
}

export async function resolvePageSections(sections: RawSection[]): Promise<RawSection[]> {
  return Promise.all(
    sections.map(async (section) => {
      if (section.type !== "blog_list") {
        return section;
      }

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
    })
  );
}
