"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { ImageUpload } from "@/components/edit/image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { gallerySchema, type GalleryContent } from "@/lib/sections/schemas/gallery";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function GalleryEditForm({
  content,
  onSave,
  isSaving,
}: SectionEditFormProps<GalleryContent>) {
  const { control, handleSubmit } = useForm<GalleryContent>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      heading: content.heading ?? "",
      images: content.images.map((image) => ({
        url: image.url,
        caption: image.caption ?? "",
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "images" });

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
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Image {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Remove image"
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
            <Controller
              control={control}
              name={`images.${index}.url`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                  <FieldDescription>Best size: 800×800px (square).</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name={`images.${index}.caption`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={`images.${index}.caption`}>Caption (optional)</FieldLabel>
                  <Input id={`images.${index}.caption`} {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ url: "", caption: "" })}>
          <Plus /> Add image
        </Button>
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
