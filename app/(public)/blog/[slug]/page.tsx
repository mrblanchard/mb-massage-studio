import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Prose } from "@/components/ui/prose";
import { getPostBySlug } from "@/lib/db/queries/posts";
import { postContentSchema } from "@/lib/blog/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    return {};
  }

  const title = post.title;
  const description = post.excerpt ?? undefined;
  const ogImage = post.coverImage || `/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/blog/${slug}`,
      images: [ogImage],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const parsed = postContentSchema.safeParse(post.content);
  const body = parsed.success ? parsed.data.body : "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      {post.publishedAt && (
        <div className="text-sm text-muted-foreground">
          {post.publishedAt.toLocaleDateString()}
        </div>
      )}
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{post.title}</h1>
      {post.coverImage && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 768px, 100vw"
            priority
          />
        </div>
      )}
      <Prose html={body} className="mt-8 text-muted-foreground" />
    </article>
  );
}
