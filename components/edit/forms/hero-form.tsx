"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/edit/image-upload";
import { heroSchema, type HeroContent } from "@/lib/sections/schemas/hero";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function HeroEditForm({ content, onSave, isSaving }: SectionEditFormProps<HeroContent>) {
  const { control, handleSubmit } = useForm<HeroContent>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      heading: content.heading,
      subheading: content.subheading ?? "",
      ctaLabel: content.ctaLabel ?? "",
      ctaHref: content.ctaHref ?? "",
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
          name="subheading"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="subheading">Subheading</FieldLabel>
              <Textarea id="subheading" rows={3} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="ctaLabel"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="ctaLabel">Button label</FieldLabel>
                <Input id="ctaLabel" {...field} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="ctaHref"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="ctaHref">Button link</FieldLabel>
                <Input id="ctaHref" placeholder="/contact" {...field} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <Field>
              <FieldLabel>Image (optional)</FieldLabel>
              <ImageUpload value={field.value} onChange={field.onChange} />
              <FieldDescription>Best size: 1200×900px (4:3).</FieldDescription>
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
