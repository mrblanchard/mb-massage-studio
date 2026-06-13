"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { testimonialsSchema, type TestimonialsContent } from "@/lib/sections/schemas/testimonials";
import type { SectionEditFormProps } from "@/lib/sections/types";

export function TestimonialsEditForm({
  content,
  onSave,
  isSaving,
}: SectionEditFormProps<TestimonialsContent>) {
  const { control, handleSubmit } = useForm<TestimonialsContent>({
    resolver: zodResolver(testimonialsSchema),
    defaultValues: {
      heading: content.heading,
      items: content.items.map((item) => ({
        quote: item.quote,
        author: item.author,
        role: item.role ?? "",
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

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
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Testimonial {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Remove testimonial"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
            <Controller
              control={control}
              name={`items.${index}.quote`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={`items.${index}.quote`}>Quote</FieldLabel>
                  <Textarea id={`items.${index}.quote`} rows={3} aria-invalid={fieldState.invalid} {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <Controller
                control={control}
                name={`items.${index}.author`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor={`items.${index}.author`}>Author</FieldLabel>
                    <Input id={`items.${index}.author`} aria-invalid={fieldState.invalid} {...field} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name={`items.${index}.role`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor={`items.${index}.role`}>Role</FieldLabel>
                    <Input id={`items.${index}.role`} {...field} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ quote: "", author: "", role: "" })}
        >
          <Plus /> Add testimonial
        </Button>
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
