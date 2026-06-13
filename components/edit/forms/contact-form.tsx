"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactContent } from "@/lib/sections/schemas/contact";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function ContactEditForm({
  content,
  onSave,
  isSaving,
}: SectionEditFormProps<ContactContent>) {
  const { control, handleSubmit } = useForm<ContactContent>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      heading: content.heading,
      body: content.body ?? "",
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
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
