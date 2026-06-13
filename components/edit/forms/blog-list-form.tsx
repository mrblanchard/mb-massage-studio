"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { blogListSchema, type BlogListContent } from "@/lib/sections/schemas/blog-list";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function BlogListEditForm({ content, onSave, isSaving }: SectionEditFormProps<BlogListContent>) {
  const { control, handleSubmit } = useForm<BlogListContent>({
    resolver: zodResolver(blogListSchema),
    defaultValues: {
      heading: content.heading ?? "",
      limit: content.limit,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Controller
          control={control}
          name="heading"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="heading">Heading (optional)</FieldLabel>
              <Input id="heading" {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="limit"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="limit">Number of posts</FieldLabel>
              <Input
                id="limit"
                type="number"
                min={1}
                max={12}
                aria-invalid={fieldState.invalid}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
              <FieldDescription>Most recent published posts to show, up to 12.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
