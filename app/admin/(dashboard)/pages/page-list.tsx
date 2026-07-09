"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { deletePage } from "./actions";

interface PageListItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
}

export function PageList({ pages }: { pages: PageListItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (pages.length === 0) {
    return <p className="text-muted-foreground">No pages yet.</p>;
  }

  const sorted = [...pages].sort((a, b) => (a.slug === "" ? -1 : b.slug === "" ? 1 : 0));

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deletePage(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Page deleted.");
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((page) => {
          const isHome = page.slug === "";
          return (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{isHome ? "Home" : page.title}</TableCell>
              <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
              <TableCell>
                <Badge variant={page.published ? "default" : "outline"}>
                  {page.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>{page.updatedAt}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/${page.slug}`}>View</Link>}
                    nativeButton={false}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/admin/pages/${page.id}`}>Edit</Link>}
                    nativeButton={false}
                  />
                  {!isHome && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => handleDelete(page.id, page.title)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
