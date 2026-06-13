import { notFound } from "next/navigation";

import { getSocialPostById } from "@/lib/db/queries/social-posts";

import { SocialComposer } from "../social-composer";

export default async function EditSocialPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getSocialPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      </div>
      <SocialComposer post={post} />
    </div>
  );
}
