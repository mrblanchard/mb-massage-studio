"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/edit/image-upload";
import { RichTextEditor } from "@/components/edit/rich-text-editor";
import { aboutSchema, type AboutContent } from "@/lib/sections/schemas/about";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function AboutEditForm({ content, onSave, isSaving }: SectionEditFormProps<AboutContent>) {
  const { control, handleSubmit } = useForm<AboutContent>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      heading: content.heading,
      body: content.body,
      imageUrl: content.imageUrl ?? "",
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
              <FieldLabel htmlFor="heading">Heading</FieldLabel>
              <Input id="heading" aria-invalid={fieldState.invalid} {...field} />
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
              <RichTextEditor value={field.value} onChange={field.onChange} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <Field>
              <FieldLabel>Image (optional)</FieldLabel>
              <ImageUpload value={field.value} onChange={field.onChange} />
              <FieldDescription>Best size: 1000×1000px (square).</FieldDescription>
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
