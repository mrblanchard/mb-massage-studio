"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { ImageUpload } from "@/components/edit/image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { postFormDefaultValues, postFormSchema, type PostFormValues } from "@/lib/blog/schema";
import type { Post } from "@/lib/db/queries/posts";

import { createPost, updatePost } from "./actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDefaultValues(post: Post | null): PostFormValues {
  if (!post) {
    return postFormDefaultValues;
  }

  const content = post.content as { body?: string } | null;

  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    coverImage: post.coverImage ?? "",
    body: content?.body ?? "",
    published: post.published,
  };
}

export function PostForm({ post }: { post: Post | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, getValues, setValue } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: toDefaultValues(post),
  });

  const onSubmit = (values: PostFormValues) => {
    startTransition(async () => {
      const result = post ? await updatePost(post.id, values) : await createPost(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Post saved.");

      if (!post && "id" in result) {
        router.push(`/admin/blog/${result.id}`);
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
              <FieldDescription>Used in the post URL: /blog/{field.value || "your-slug"}</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="excerpt"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
              <Textarea id="excerpt" rows={2} {...field} />
              <FieldDescription>Short summary shown on the blog list and in search results.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="coverImage"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Cover image</FieldLabel>
              <ImageUpload value={field.value} onChange={field.onChange} />
              <FieldDescription>Best size: 1200×675px (16:9).</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="body"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="body">Body</FieldLabel>
              <Textarea id="body" rows={12} {...field} />
              <FieldDescription>Separate paragraphs with a blank line.</FieldDescription>
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
          {isPending ? "Saving..." : "Save post"}
        </Button>
      </div>
    </form>
  );
}
