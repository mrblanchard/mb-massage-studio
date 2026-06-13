import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { BlogListContent } from "@/lib/sections/schemas/blog-list";

export function BlogListSection({ content }: { content: BlogListContent }) {
  const posts = content.posts ?? [];

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      {content.heading && (
        <h2 className="text-center text-3xl font-bold tracking-tight">{content.heading}</h2>
      )}
      {posts.length > 0 ? (
        <div className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-3", content.heading && "mt-10")}>
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col gap-3">
              {post.coverImage && (
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative block aspect-video w-full overflow-hidden rounded-lg"
                >
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </Link>
              )}
              <div>
                {post.publishedAt && (
                  <div className="text-sm text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                )}
                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={cn("text-center text-sm text-muted-foreground", content.heading && "mt-10")}>
          No posts yet.
        </p>
      )}
    </section>
  );
}
