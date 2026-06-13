"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ctaSchema, type CtaContent } from "@/lib/sections/schemas/cta";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function CtaEditForm({ content, onSave, isSaving }: SectionEditFormProps<CtaContent>) {
  const { control, handleSubmit } = useForm<CtaContent>({
    resolver: zodResolver(ctaSchema),
    defaultValues: {
      heading: content.heading,
      body: content.body ?? "",
      ctaLabel: content.ctaLabel,
      ctaHref: content.ctaHref,
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
              <Textarea id="body" rows={3} {...field} />
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
                <Input id="ctaLabel" aria-invalid={fieldState.invalid} {...field} />
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
                <Input id="ctaHref" placeholder="/contact" aria-invalid={fieldState.invalid} {...field} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
