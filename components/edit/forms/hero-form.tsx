"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/edit/image-upload";
import { heroSchema, type HeroContent } from "@/lib/sections/schemas/hero";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function HeroEditForm({ content, onSave, isSaving }: SectionEditFormProps<HeroContent>) {
  const { control, handleSubmit, watch } = useForm<HeroContent>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      heading: content.heading ?? "",
      subheading: content.subheading ?? "",
      ctaLabel: content.ctaLabel ?? "",
      ctaHref: content.ctaHref ?? "",
      imageUrl: content.imageUrl ?? "",
      layout: content.layout ?? "side",
      logoUrl: content.logoUrl ?? "",
      logoSize: content.logoSize ?? "large",
      overlayDarkness: content.overlayDarkness ?? "medium",
      hideTextVisually: content.hideTextVisually ?? false,
    },
  });
  const layout = watch("layout");

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Controller
          control={control}
          name="heading"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="heading">Heading (optional)</FieldLabel>
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
        <Controller
          control={control}
          name="hideTextVisually"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Switch
                id="hideTextVisually"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
              <FieldLabel htmlFor="hideTextVisually" className="mb-0">
                Hide heading &amp; subheading visually
              </FieldLabel>
              <FieldDescription>
                Keeps them in the page for accessibility/SEO (e.g. when a logo image already
                shows the business name) without displaying them.
              </FieldDescription>
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
          name="layout"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="layout">Layout</FieldLabel>
              <select
                id="layout"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={field.value}
                onChange={field.onChange}
              >
                <option value="side">Side-by-side</option>
                <option value="overlay">Full-bleed background</option>
              </select>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <Field>
              <FieldLabel>
                {layout === "overlay" ? "Background image" : "Image (optional)"}
              </FieldLabel>
              <ImageUpload value={field.value} onChange={field.onChange} />
              <FieldDescription>
                {layout === "overlay"
                  ? "Best size: 1920×1080px, a darkened overlay is applied automatically."
                  : "Best size: 1200×900px (4:3)."}
              </FieldDescription>
            </Field>
          )}
        />
        {layout === "overlay" && (
          <Controller
            control={control}
            name="logoUrl"
            render={({ field }) => (
              <Field>
                <FieldLabel>Centered logo (optional)</FieldLabel>
                <ImageUpload value={field.value} onChange={field.onChange} />
                <FieldDescription>Displayed centered above the heading.</FieldDescription>
              </Field>
            )}
          />
        )}
        {layout === "overlay" && (
          <Controller
            control={control}
            name="logoSize"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="logoSize">Logo size</FieldLabel>
                <select
                  id="logoSize"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra large</option>
                </select>
              </Field>
            )}
          />
        )}
        {layout === "overlay" && (
          <Controller
            control={control}
            name="overlayDarkness"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="overlayDarkness">Overlay darkness</FieldLabel>
                <select
                  id="overlayDarkness"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="dark">Dark</option>
                </select>
              </Field>
            )}
          />
        )}
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
