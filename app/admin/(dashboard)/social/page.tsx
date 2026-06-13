import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSocialPosts } from "@/lib/db/queries/social-posts";

import { SocialCalendar } from "./social-calendar";
import { SocialPostList } from "./social-post-list";

export default async function SocialPage() {
  const posts = await getSocialPosts();

  const events = posts
    .filter((post) => post.scheduledAt !== null)
    .map((post) => ({
      id: post.id,
      title: post.content.length > 40 ? `${post.content.slice(0, 40)}...` : post.content,
      start: post.scheduledAt!.toISOString(),
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Social</h1>
          <p className="text-muted-foreground">Plan and schedule social media posts.</p>
        </div>
        <Button
          render={<Link href="/admin/social/new">New post</Link>}
          nativeButton={false}
        />
      </div>
      <SocialCalendar events={events} />
      <SocialPostList
        posts={posts.map((post) => ({
          id: post.id,
          content: post.content,
          platforms: post.platforms,
          status: post.status,
          scheduledAt: post.scheduledAt ? post.scheduledAt.toLocaleString() : null,
        }))}
      />
    </div>
  );
}
