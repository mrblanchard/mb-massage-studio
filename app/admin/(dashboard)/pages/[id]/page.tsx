import { notFound } from "next/navigation";

import { getPageById } from "@/lib/db/queries/pages";

import { PageForm } from "../page-form";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageById(id);

  if (!page) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit {page.slug === "" ? "Home page" : "page"}
        </h1>
        <p className="text-muted-foreground">{page.title}</p>
      </div>
      <PageForm page={page} />
    </div>
  );
}
