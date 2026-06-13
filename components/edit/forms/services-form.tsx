"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { servicesSchema, type ServicesContent } from "@/lib/sections/schemas/services";
import type { SectionEditFormProps } from "@/lib/sections/types";

const alignmentItems = {
  left: "Left",
  center: "Center",
  right: "Right",
  full: "Full width",
};

export function ServicesEditForm({
  content,
  onSave,
  isSaving,
}: SectionEditFormProps<ServicesContent>) {
  const { control, handleSubmit } = useForm<ServicesContent>({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      heading: content.heading,
      alignment: content.alignment ?? "center",
      items: content.items.map((item) => ({
        title: item.title,
        description: item.description ?? "",
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
        <Controller
          control={control}
          name="alignment"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="alignment">Layout</FieldLabel>
              <Select
                items={alignmentItems}
                value={field.value ?? "center"}
                onValueChange={(value) => field.onChange(value ?? "center")}
              >
                <SelectTrigger id="alignment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(alignmentItems).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Service {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Remove service"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
            <Controller
              control={control}
              name={`items.${index}.title`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={`items.${index}.title`}>Title</FieldLabel>
                  <Input id={`items.${index}.title`} aria-invalid={fieldState.invalid} {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name={`items.${index}.description`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={`items.${index}.description`}>Description</FieldLabel>
                  <Textarea id={`items.${index}.description`} rows={2} {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: "", description: "" })}
        >
          <Plus /> Add service
        </Button>
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
