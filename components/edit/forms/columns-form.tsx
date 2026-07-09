"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";

import { ImageUpload } from "@/components/edit/image-upload";
import { RichTextEditor } from "@/components/edit/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { columnsSchema, type ColumnsContent } from "@/lib/sections/schemas/columns";
import type { SectionEditFormProps } from "@/lib/sections/types";

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 4;

export function ColumnsEditForm({
  content,
  onSave,
  isSaving,
}: SectionEditFormProps<ColumnsContent>) {
  const { control, handleSubmit, setValue } = useForm<ColumnsContent>({
    resolver: zodResolver(columnsSchema),
    defaultValues: {
      heading: content.heading ?? "",
      columns: content.columns.map((column) => ({
        imageUrl: column.imageUrl ?? "",
        content: column.content ?? "",
        payPalButton: column.payPalButton,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "columns" });

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
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Column {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Remove column"
                disabled={fields.length <= MIN_COLUMNS}
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
            <Controller
              control={control}
              name={`columns.${index}.imageUrl`}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Image (optional)</FieldLabel>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name={`columns.${index}.content`}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Content (optional)</FieldLabel>
                  <RichTextEditor value={field.value ?? ""} onChange={field.onChange} />
                </Field>
              )}
            />
            <PayPalButtonEditor control={control} setValue={setValue} columnIndex={index} />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          disabled={fields.length >= MAX_COLUMNS}
          onClick={() => append({ imageUrl: "", content: "" })}
        >
          <Plus /> Add column
        </Button>
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

function PayPalButtonEditor({
  control,
  setValue,
  columnIndex,
}: {
  control: Control<ColumnsContent>;
  setValue: UseFormSetValue<ColumnsContent>;
  columnIndex: number;
}) {
  const payPalButton = useWatch({ control, name: `columns.${columnIndex}.payPalButton` });

  if (!payPalButton) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setValue(`columns.${columnIndex}.payPalButton`, {
            hostedButtonId: "",
            itemName: "Purchase a Gift Card",
            options: [{ label: "", value: "" }],
            qrCodeUrl: "",
          })
        }
      >
        <Plus /> Add PayPal buy button
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">PayPal buy button</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Remove PayPal button"
          onClick={() => setValue(`columns.${columnIndex}.payPalButton`, undefined)}
        >
          <Trash2 />
        </Button>
      </div>
      <Controller
        control={control}
        name={`columns.${columnIndex}.payPalButton.hostedButtonId`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel>PayPal hosted button ID</FieldLabel>
            <Input placeholder="e.g. 5XREDN4JE68C6" {...field} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        control={control}
        name={`columns.${columnIndex}.payPalButton.itemName`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel>Item name (shown above the dropdown)</FieldLabel>
            <Input placeholder="Purchase a Gift Card" {...field} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        control={control}
        name={`columns.${columnIndex}.payPalButton.qrCodeUrl`}
        render={({ field }) => (
          <Field>
            <FieldLabel>QR code image (optional)</FieldLabel>
            <ImageUpload value={field.value} onChange={field.onChange} />
          </Field>
        )}
      />
      <PayPalButtonOptions control={control} columnIndex={columnIndex} />
    </div>
  );
}

function PayPalButtonOptions({
  control,
  columnIndex,
}: {
  control: Control<ColumnsContent>;
  columnIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `columns.${columnIndex}.payPalButton.options`,
  });

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>Dropdown options</FieldLabel>
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex items-end gap-2">
          <Controller
            control={control}
            name={`columns.${columnIndex}.payPalButton.options.${optionIndex}.label`}
            render={({ field }) => (
              <Field className="flex-1">
                <FieldLabel>Label</FieldLabel>
                <Input placeholder="1 Hour Massage $95.00 USD" {...field} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name={`columns.${columnIndex}.payPalButton.options.${optionIndex}.value`}
            render={({ field }) => (
              <Field className="flex-1">
                <FieldLabel>PayPal option value</FieldLabel>
                <Input placeholder="1 Hour Massage" {...field} />
              </Field>
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Remove option"
            disabled={fields.length <= 1}
            onClick={() => remove(optionIndex)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ label: "", value: "" })}>
        <Plus /> Add option
      </Button>
    </div>
  );
}
