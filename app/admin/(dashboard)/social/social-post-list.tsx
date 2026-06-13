"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { platformLabels, type SocialPlatform } from "@/lib/social/schema";

import { deleteSocialPost } from "./actions";

interface SocialPostListItem {
  id: string;
  content: string;
  platforms: string[];
  status: "draft" | "scheduled" | "posted" | "failed";
  scheduledAt: string | null;
}

const statusVariants = {
  draft: "outline",
  scheduled: "secondary",
  posted: "default",
  failed: "destructive",
} as const;

export function SocialPostList({ posts }: { posts: SocialPostListItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (posts.length === 0) {
    return <p className="text-muted-foreground">No posts yet.</p>;
  }

  const handleDelete = (id: string, excerpt: string) => {
    if (!window.confirm(`Delete "${excerpt}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteSocialPost(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Post deleted.");
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead>Platforms</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => {
          const excerpt = post.content.length > 80 ? `${post.content.slice(0, 80)}...` : post.content;
          return (
            <TableRow key={post.id}>
              <TableCell className="max-w-xs truncate font-medium">{excerpt}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {post.platforms.map((platform) => (
                    <Badge key={platform} variant="outline">
                      {platformLabels[platform as SocialPlatform] ?? platform}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[post.status]}>{post.status}</Badge>
              </TableCell>
              <TableCell>{post.scheduledAt ?? "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/admin/social/${post.id}`}>Edit</Link>}
                    nativeButton={false}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => handleDelete(post.id, excerpt)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
