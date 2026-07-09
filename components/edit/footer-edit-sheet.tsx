"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { toast } from "sonner";

import { updateFooterSettings } from "@/app/admin/(dashboard)/settings/header-footer-actions";
import {
  footerSettingsSchema,
  type FooterSettingsValues,
} from "@/app/admin/(dashboard)/settings/header-footer-schema";
import { RichTextEditor } from "@/components/edit/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FooterEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagline?: string | null;
  businessInfo?: { address?: string; phone?: string; email?: string; hours?: string };
  footerColumns: { heading?: string; body?: string; links: { label: string; href: string }[] }[];
  socialLinks?: Record<string, string>;
}

export function FooterEditSheet({
  open,
  onOpenChange,
  tagline,
  businessInfo,
  footerColumns,
  socialLinks,
}: FooterEditSheetProps) {
  const [isSaving, startTransition] = useTransition();
  const { control, handleSubmit, register } = useForm<FooterSettingsValues>({
    resolver: zodResolver(footerSettingsSchema),
    defaultValues: {
      tagline: tagline ?? "",
      businessInfo: {
        address: businessInfo?.address ?? "",
        phone: businessInfo?.phone ?? "",
        email: businessInfo?.email ?? "",
        hours: businessInfo?.hours ?? "",
      },
      footerColumns,
      socialLinks: socialLinks
        ? Object.entries(socialLinks).map(([platform, url]) => ({ platform, url }))
        : [],
    },
  });
  const footerCols = useFieldArray({ control, name: "footerColumns" });
  const socialLinksArray = useFieldArray({ control, name: "socialLinks" });

  const onSubmit = (values: FooterSettingsValues) => {
    startTransition(async () => {
      const result = await updateFooterSettings(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Footer updated.");
        onOpenChange(false);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Footer</SheetTitle>
          <SheetDescription>Changes are published immediately after saving.</SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4 px-4 pb-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="footer-tagline">Tagline</FieldLabel>
              <Input id="footer-tagline" {...register("tagline")} />
            </Field>

            <hr className="my-2" />
            <p className="text-sm font-medium">Business info</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="footer-address">Address</FieldLabel>
                <Input id="footer-address" {...register("businessInfo.address")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="footer-phone">Phone</FieldLabel>
                <Input id="footer-phone" {...register("businessInfo.phone")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="footer-email">Email</FieldLabel>
                <Input id="footer-email" {...register("businessInfo.email")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="footer-hours">Hours</FieldLabel>
                <Input id="footer-hours" placeholder="Mon-Fri 9am-5pm" {...register("businessInfo.hours")} />
              </Field>
            </div>

            <hr className="my-2" />
            <p className="text-sm font-medium">Footer columns</p>
            {footerCols.fields.map((field, colIndex) => (
              <div key={field.id} className="flex flex-col gap-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Column {colIndex + 1}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Remove column"
                    onClick={() => footerCols.remove(colIndex)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <Field>
                  <FieldLabel>Heading</FieldLabel>
                  <Input
                    placeholder="Quick Links"
                    {...register(`footerColumns.${colIndex}.heading` as const)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Body (optional)</FieldLabel>
                  <Controller
                    control={control}
                    name={`footerColumns.${colIndex}.body` as const}
                    render={({ field: bodyField }) => (
                      <RichTextEditor
                        value={bodyField.value ?? ""}
                        onChange={bodyField.onChange}
                        placeholder="Add some text..."
                      />
                    )}
                  />
                </Field>
                <FooterColumnLinks control={control} register={register} columnIndex={colIndex} />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => footerCols.append({ heading: "", body: "", links: [] })}
            >
              <Plus /> Add column
            </Button>

            <hr className="my-2" />
            <p className="text-sm font-medium">Social links</p>
            {socialLinksArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`footer-socialLinks.${index}.platform`}>Platform</FieldLabel>
                  <Input
                    id={`footer-socialLinks.${index}.platform`}
                    placeholder="instagram"
                    {...register(`socialLinks.${index}.platform` as const)}
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor={`footer-socialLinks.${index}.url`}>URL</FieldLabel>
                  <Input
                    id={`footer-socialLinks.${index}.url`}
                    placeholder="https://instagram.com/yourbusiness"
                    {...register(`socialLinks.${index}.url` as const)}
                  />
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove social link"
                  onClick={() => socialLinksArray.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => socialLinksArray.append({ platform: "", url: "" })}
            >
              <Plus /> Add social link
            </Button>
          </FieldGroup>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function FooterColumnLinks({
  control,
  register,
  columnIndex,
}: {
  control: Control<FooterSettingsValues>;
  register: UseFormRegister<FooterSettingsValues>;
  columnIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `footerColumns.${columnIndex}.links` as const,
  });

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>Links</FieldLabel>
      {fields.map((field, linkIndex) => (
        <div key={field.id} className="flex items-end gap-2">
          <Field className="flex-1">
            <FieldLabel>Label</FieldLabel>
            <Input
              placeholder="Privacy Policy"
              {...register(`footerColumns.${columnIndex}.links.${linkIndex}.label` as const)}
            />
          </Field>
          <Field className="flex-1">
            <FieldLabel>URL</FieldLabel>
            <Input
              placeholder="/privacy"
              {...register(`footerColumns.${columnIndex}.links.${linkIndex}.href` as const)}
            />
          </Field>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Remove link"
            onClick={() => remove(linkIndex)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ label: "", href: "" })}>
        <Plus /> Add link
      </Button>
    </div>
  );
}
