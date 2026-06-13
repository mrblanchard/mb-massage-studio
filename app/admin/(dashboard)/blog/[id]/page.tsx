import { notFound } from "next/navigation";

import { getPostById } from "@/lib/db/queries/posts";

import { PostForm } from "../post-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
        <p className="text-muted-foreground">{post.title}</p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
