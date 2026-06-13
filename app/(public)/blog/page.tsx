import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedPosts } from "@/lib/db/queries/posts";
import { getSiteSettings } from "@/lib/db/queries/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = "Blog";
  const description = settings?.tagline || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "/blog",
      images: [`/api/og?title=${encodeURIComponent(title)}`],
    },
  };
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      {posts.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col gap-4 sm:flex-row">
              {post.coverImage && (
                <Link href={`/blog/${post.slug}`} className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:w-48">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 192px, 100vw"
                  />
                </Link>
              )}
              <div>
                {post.publishedAt && (
                  <div className="text-sm text-muted-foreground">
                    {post.publishedAt.toLocaleDateString()}
                  </div>
                )}
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
