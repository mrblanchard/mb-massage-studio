"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { ImageUpload } from "@/components/edit/image-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SiteSettings } from "@/lib/db/queries/site-settings";

import { updateSiteSettings } from "./actions";
import { siteSettingsSchema, type SiteSettingsFormValues } from "./schema";

function toDefaultValues(settings: SiteSettings | null): SiteSettingsFormValues {
  return {
    siteName: settings?.siteName ?? "",
    tagline: settings?.tagline ?? "",
    logoUrl: settings?.logoUrl ?? "",
    faviconUrl: settings?.faviconUrl ?? "",
    primaryColor: settings?.primaryColor ?? "",
    secondaryColor: settings?.secondaryColor ?? "",
    fontHeading: settings?.fontHeading ?? "",
    fontBody: settings?.fontBody ?? "",
    contactEmail: settings?.contactEmail ?? "",
    cfAnalyticsToken: settings?.cfAnalyticsToken ?? "",
    navLinks: settings?.navLinks?.length ? settings.navLinks : [{ label: "", href: "" }],
    socialLinks: settings?.socialLinks
      ? Object.entries(settings.socialLinks).map(([platform, url]) => ({ platform, url }))
      : [],
    businessInfo: {
      address: settings?.businessInfo?.address ?? "",
      phone: settings?.businessInfo?.phone ?? "",
      email: settings?.businessInfo?.email ?? "",
      hours: settings?.businessInfo?.hours ?? "",
    },
  };
}

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, register } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toDefaultValues(settings),
  });

  const navLinks = useFieldArray({ control, name: "navLinks" });
  const socialLinks = useFieldArray({ control, name: "socialLinks" });

  const onSubmit = (values: SiteSettingsFormValues) => {
    startTransition(async () => {
      const result = await updateSiteSettings(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Settings saved.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Your business name and tagline appear in the header and browser tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={control}
              name="siteName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="siteName">Business name</FieldLabel>
                  <Input id="siteName" aria-invalid={fieldState.invalid} {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="tagline"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
                  <Input id="tagline" aria-invalid={fieldState.invalid} {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="contactEmail"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="contactEmail">Contact email</FieldLabel>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="hello@yourbusiness.com"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Logo, favicon, brand colors, and fonts used across the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="logoUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel>Logo</FieldLabel>
                    <ImageUpload value={field.value} onChange={field.onChange} allowManualUrl />
                    <FieldDescription>
                      Best size: ~400×100px (wide), transparent PNG works best.
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="faviconUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel>Favicon</FieldLabel>
                    <ImageUpload value={field.value} onChange={field.onChange} allowManualUrl />
                    <FieldDescription>Best size: 512×512px (square) PNG.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="primaryColor">Primary color</FieldLabel>
                <Input id="primaryColor" placeholder="#171717" {...register("primaryColor")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="secondaryColor">Secondary color</FieldLabel>
                <Input id="secondaryColor" placeholder="#f5f5f5" {...register("secondaryColor")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="fontHeading">Heading font</FieldLabel>
                <Input id="fontHeading" placeholder="Inter" {...register("fontHeading")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="fontBody">Body font</FieldLabel>
                <Input id="fontBody" placeholder="Inter" {...register("fontBody")} />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>Links shown in the site header.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {navLinks.fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`navLinks.${index}.label`}>Label</FieldLabel>
                  <Input
                    id={`navLinks.${index}.label`}
                    placeholder="About"
                    {...register(`navLinks.${index}.label` as const)}
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor={`navLinks.${index}.href`}>Link</FieldLabel>
                  <Input
                    id={`navLinks.${index}.href`}
                    placeholder="/about"
                    {...register(`navLinks.${index}.href` as const)}
                  />
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove nav link"
                  onClick={() => navLinks.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => navLinks.append({ label: "", href: "" })}
            >
              <Plus /> Add link
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business info</CardTitle>
          <CardDescription>
            Shown on the contact section and in the website footer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="businessInfo.address">Address</FieldLabel>
                <Input id="businessInfo.address" {...register("businessInfo.address")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="businessInfo.phone">Phone</FieldLabel>
                <Input id="businessInfo.phone" {...register("businessInfo.phone")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="businessInfo.email">Email</FieldLabel>
                <Input id="businessInfo.email" {...register("businessInfo.email")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="businessInfo.hours">Hours</FieldLabel>
                <Input
                  id="businessInfo.hours"
                  placeholder="Mon-Fri 9am-5pm"
                  {...register("businessInfo.hours")}
                />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Shown as icons in the website footer.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {socialLinks.fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`socialLinks.${index}.platform`}>Platform</FieldLabel>
                  <Input
                    id={`socialLinks.${index}.platform`}
                    placeholder="instagram"
                    {...register(`socialLinks.${index}.platform` as const)}
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor={`socialLinks.${index}.url`}>URL</FieldLabel>
                  <Input
                    id={`socialLinks.${index}.url`}
                    placeholder="https://instagram.com/yourbusiness"
                    {...register(`socialLinks.${index}.url` as const)}
                  />
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove social link"
                  onClick={() => socialLinks.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => socialLinks.append({ platform: "", url: "" })}
            >
              <Plus /> Add social link
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Cloudflare Web Analytics token (optional).</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cfAnalyticsToken">Cloudflare Analytics token</FieldLabel>
              <Input id="cfAnalyticsToken" {...register("cfAnalyticsToken")} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
