"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { richTextSchema, type RichTextContent } from "@/lib/sections/schemas/rich-text";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function RichTextEditForm({
  content,
  onSave,
  isSaving,
}: SectionEditFormProps<RichTextContent>) {
  const { control, handleSubmit } = useForm<RichTextContent>({
    resolver: zodResolver(richTextSchema),
    defaultValues: {
      heading: content.heading ?? "",
      body: content.body,
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
          name="body"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="body">Body</FieldLabel>
              <Textarea id="body" rows={10} aria-invalid={fieldState.invalid} {...field} />
              <FieldDescription>Separate paragraphs with a blank line.</FieldDescription>
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
