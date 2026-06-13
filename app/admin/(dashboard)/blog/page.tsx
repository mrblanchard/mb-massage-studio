import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getAllPosts } from "@/lib/db/queries/posts";

import { PostList } from "./post-list";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Manage blog posts.</p>
        </div>
        <Button
          render={<Link href="/admin/blog/new">New post</Link>}
          nativeButton={false}
        />
      </div>
      <PostList
        posts={posts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          published: post.published,
          updatedAt: post.updatedAt.toLocaleDateString(),
        }))}
      />
    </div>
  );
}
