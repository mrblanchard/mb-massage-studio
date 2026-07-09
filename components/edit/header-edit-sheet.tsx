"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateHeaderSettings } from "@/app/admin/(dashboard)/settings/header-footer-actions";
import {
  headerSettingsSchema,
  type HeaderSettingsValues,
} from "@/app/admin/(dashboard)/settings/header-footer-schema";
import { ImageUpload } from "@/components/edit/image-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

interface HeaderEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteName: string;
  logoUrl?: string | null;
  navLinks: { label: string; href: string }[];
  headerCtaLabel?: string | null;
  headerCtaHref?: string | null;
  homeSections: { id: string; label: string }[];
}

export function HeaderEditSheet({
  open,
  onOpenChange,
  siteName,
  logoUrl,
  navLinks,
  headerCtaLabel,
  headerCtaHref,
  homeSections,
}: HeaderEditSheetProps) {
  const [isSaving, startTransition] = useTransition();
  const { control, handleSubmit, register } = useForm<HeaderSettingsValues>({
    resolver: zodResolver(headerSettingsSchema),
    defaultValues: {
      siteName,
      logoUrl: logoUrl ?? "",
      navLinks: navLinks.length ? navLinks : [{ label: "", href: "" }],
      headerCtaLabel: headerCtaLabel ?? "",
      headerCtaHref: headerCtaHref ?? "",
    },
  });
  const navLinksArray = useFieldArray({ control, name: "navLinks" });

  const onSubmit = (values: HeaderSettingsValues) => {
    startTransition(async () => {
      const result = await updateHeaderSettings(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Header updated.");
        onOpenChange(false);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Header</SheetTitle>
          <SheetDescription>Changes are published immediately after saving.</SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4 px-4 pb-4"
        >
          <FieldGroup>
            <Controller
              control={control}
              name="siteName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="header-siteName">Business name</FieldLabel>
                  <Input id="header-siteName" aria-invalid={fieldState.invalid} {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="logoUrl"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Logo (optional)</FieldLabel>
                  <ImageUpload value={field.value} onChange={field.onChange} allowManualUrl />
                </Field>
              )}
            />

            {navLinksArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`header-navLinks.${index}.label`}>Label</FieldLabel>
                  <Input
                    id={`header-navLinks.${index}.label`}
                    placeholder="About"
                    {...register(`navLinks.${index}.label` as const)}
                  />
                </Field>
                <Controller
                  control={control}
                  name={`navLinks.${index}.href` as const}
                  render={({ field: hrefField }) => {
                    const isSection = homeSections.some((s) => hrefField.value === `/#${s.id}`);
                    const selectVal = isSection ? hrefField.value : "__custom__";
                    return (
                      <Field className="flex-1">
                        <FieldLabel>Link</FieldLabel>
                        <select
                          className={selectClass}
                          value={selectVal}
                          onChange={(e) => {
                            if (e.target.value !== "__custom__") {
                              hrefField.onChange(e.target.value);
                            }
                          }}
                        >
                          <option value="__custom__">Custom URL</option>
                          {homeSections.map((s) => (
                            <option key={s.id} value={`/#${s.id}`}>
                              Section: {s.label}
                            </option>
                          ))}
                        </select>
                        {selectVal === "__custom__" && (
                          <Input
                            placeholder="/about"
                            value={hrefField.value}
                            onChange={hrefField.onChange}
                            onBlur={hrefField.onBlur}
                          />
                        )}
                      </Field>
                    );
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove nav link"
                  className="mt-6 shrink-0"
                  onClick={() => navLinksArray.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => navLinksArray.append({ label: "", href: "" })}
            >
              <Plus /> Add link
            </Button>

            <hr className="my-2" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="header-ctaLabel">Header button label</FieldLabel>
                <Input
                  id="header-ctaLabel"
                  placeholder="603-283-8443"
                  {...register("headerCtaLabel")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="header-ctaHref">Header button link</FieldLabel>
                <Input
                  id="header-ctaHref"
                  placeholder="tel:6032838443"
                  {...register("headerCtaHref")}
                />
              </Field>
            </div>
          </FieldGroup>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
