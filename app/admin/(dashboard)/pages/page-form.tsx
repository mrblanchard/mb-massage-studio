"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Page } from "@/lib/db/queries/pages";
import { pageFormDefaultValues, pageFormSchema, type PageFormValues } from "@/lib/pages/schema";

import { createPage, updatePage } from "./actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDefaultValues(page: Page | null): PageFormValues {
  if (!page) {
    return pageFormDefaultValues;
  }

  return {
    title: page.title,
    slug: page.slug,
    metaDescription: page.metaDescription ?? "",
    published: page.published,
  };
}

export function PageForm({ page }: { page: Page | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isHome = page?.slug === "";

  const { control, handleSubmit, getValues, setValue } = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: toDefaultValues(page),
  });

  const onSubmit = (values: PageFormValues) => {
    startTransition(async () => {
      const result = page ? await updatePage(page.id, values) : await createPage(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Page saved.");

      if (!page && "id" in result) {
        router.push(`/admin/pages/${result.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const handleGenerateSlug = () => {
    const title = getValues("title");
    if (title) {
      setValue("slug", slugify(title));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {!isHome && (
          <Controller
            control={control}
            name="slug"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="slug">Slug</FieldLabel>
                <div className="flex gap-2">
                  <Input id="slug" aria-invalid={fieldState.invalid} {...field} />
                  <Button type="button" variant="outline" onClick={handleGenerateSlug}>
                    Generate from title
                  </Button>
                </div>
                <FieldDescription>Used in the page URL: /{field.value || "your-slug"}</FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        )}
        <Controller
          control={control}
          name="metaDescription"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="metaDescription">Meta description</FieldLabel>
              <Textarea id="metaDescription" rows={2} {...field} />
              <FieldDescription>Shown in search engine results.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="published"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid || undefined}>
              <Switch
                id="published"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
              <FieldLabel htmlFor="published">Published</FieldLabel>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save page"}
        </Button>
      </div>
    </form>
  );
}
