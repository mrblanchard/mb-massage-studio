"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { deletePost } from "./actions";

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
}

export function PostList({ posts }: { posts: PostListItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (posts.length === 0) {
    return <p className="text-muted-foreground">No posts yet.</p>;
  }

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deletePost(id);
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
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">{post.title}</TableCell>
            <TableCell>
              <Badge variant={post.published ? "default" : "outline"}>
                {post.published ? "Published" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell>{post.updatedAt}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/admin/blog/${post.id}`}>Edit</Link>}
                  nativeButton={false}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => handleDelete(post.id, post.title)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
