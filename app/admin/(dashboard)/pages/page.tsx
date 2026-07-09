import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getAllPages } from "@/lib/db/queries/pages";

import { PageList } from "./page-list";

export default async function AdminPagesPage() {
  const pages = await getAllPages();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">Manage the pages on your site.</p>
        </div>
        <Button render={<Link href="/admin/pages/new">New page</Link>} nativeButton={false} />
      </div>
      <PageList
        pages={pages.map((page) => ({
          id: page.id,
          title: page.title,
          slug: page.slug,
          published: page.published,
          updatedAt: page.updatedAt.toLocaleDateString(),
        }))}
      />
    </div>
  );
}
