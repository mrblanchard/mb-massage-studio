"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactContent } from "@/lib/sections/schemas/contact";
import type { SectionEditFormProps } from "@/lib/sections/types";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const MIN_FIELDS = 1;

export function ContactEditForm({
  content,
  onSave,
  isSaving,
}: SectionEditFormProps<ContactContent>) {
  const { control, handleSubmit, register } = useForm<ContactContent>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      heading: content.heading,
      body: content.body ?? "",
      fields: content.fields.map((field) => ({ ...field })),
      notifyEmail: content.notifyEmail ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fields" });

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
        <Controller
          control={control}
          name="notifyEmail"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="notifyEmail">Send submissions to (optional)</FieldLabel>
              <Input
                id="notifyEmail"
                type="email"
                placeholder="hello@yourbusiness.com"
                {...field}
              />
              <FieldDescription>
                Leave blank to use the site-wide contact email from Settings.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <hr className="my-2" />
        <p className="text-sm font-medium">Form fields</p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Field {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Remove field"
                disabled={fields.length <= MIN_FIELDS}
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
            <Field>
              <FieldLabel>Label</FieldLabel>
              <Input placeholder="Name" {...register(`fields.${index}.label` as const)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <select className={selectClass} {...register(`fields.${index}.type` as const)}>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="textarea">Paragraph</option>
                  <option value="number">Number</option>
                </select>
              </Field>
              <Controller
                control={control}
                name={`fields.${index}.required` as const}
                render={({ field: requiredField }) => (
                  <Field>
                    <FieldLabel className="mb-0">Required</FieldLabel>
                    <Switch
                      checked={requiredField.value}
                      onCheckedChange={requiredField.onChange}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              label: "",
              type: "text",
              required: true,
            })
          }
        >
          <Plus /> Add field
        </Button>
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
