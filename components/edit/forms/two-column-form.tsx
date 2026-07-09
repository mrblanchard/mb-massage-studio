"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { RichTextEditor } from "@/components/edit/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { twoColumnSchema, type TwoColumnContent } from "@/lib/sections/schemas/two-column";
import type { SectionEditFormProps } from "@/lib/sections/types";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function TwoColumnEditForm({
  content,
  onSave,
  isSaving,
}: SectionEditFormProps<TwoColumnContent>) {
  const { control, handleSubmit } = useForm<TwoColumnContent>({
    resolver: zodResolver(twoColumnSchema),
    defaultValues: {
      heading: content.heading ?? "",
      mainContent: content.mainContent,
      sidebarContent: content.sidebarContent,
      sidebarPosition: content.sidebarPosition ?? "right",
      mainWidth: content.mainWidth ?? "70",
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="sidebarPosition"
            render={({ field }) => (
              <Field>
                <FieldLabel>Sidebar position</FieldLabel>
                <select className={selectClass} value={field.value} onChange={field.onChange}>
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </Field>
            )}
          />
          <Controller
            control={control}
            name="mainWidth"
            render={({ field }) => (
              <Field>
                <FieldLabel>Main column width</FieldLabel>
                <select className={selectClass} value={field.value} onChange={field.onChange}>
                  <option value="60">60% main / 40% sidebar</option>
                  <option value="70">70% main / 30% sidebar</option>
                  <option value="75">75% main / 25% sidebar</option>
                </select>
              </Field>
            )}
          />
        </div>
        <Controller
          control={control}
          name="mainContent"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Main content</FieldLabel>
              <RichTextEditor value={field.value} onChange={field.onChange} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="sidebarContent"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Sidebar content</FieldLabel>
              <RichTextEditor value={field.value} onChange={field.onChange} />
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
