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

import { ColorField } from "@/components/edit/color-field";
import { ImageUpload } from "@/components/edit/image-upload";
import { RichTextEditor } from "@/components/edit/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fontOptions } from "@/lib/fonts";
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

const TYPOGRAPHY_ROLES = [
  { key: "h1", label: "Heading 1" },
  { key: "h2", label: "Heading 2" },
  { key: "h3", label: "Heading 3" },
  { key: "h4", label: "Heading 4" },
  { key: "body", label: "Body text" },
  { key: "small", label: "Small text" },
  { key: "button", label: "Buttons" },
  { key: "link", label: "Links" },
] as const;

function toDefaultValues(settings: SiteSettings | null): SiteSettingsFormValues {
  return {
    siteName: settings?.siteName ?? "",
    tagline: settings?.tagline ?? "",
    logoUrl: settings?.logoUrl ?? "",
    faviconUrl: settings?.faviconUrl ?? "",
    primaryColor: settings?.primaryColor ?? "",
    secondaryColor: settings?.secondaryColor ?? "",
    fontHeading: settings?.fontHeading ?? "Inter",
    fontBody: settings?.fontBody ?? "Inter",
    baseFontSize: (settings?.baseFontSize as "small" | "medium" | "large") ?? "medium",
    typography: settings?.typography ?? {},
    contactEmail: settings?.contactEmail ?? "",
    cfAnalyticsToken: settings?.cfAnalyticsToken ?? "",
    navLinks: settings?.navLinks?.length ? settings.navLinks : [{ label: "", href: "" }],
    headerCtaLabel: settings?.headerCtaLabel ?? "",
    headerCtaHref: settings?.headerCtaHref ?? "",
    socialLinks: settings?.socialLinks
      ? Object.entries(settings.socialLinks).map(([platform, url]) => ({ platform, url }))
      : [],
    businessInfo: {
      address: settings?.businessInfo?.address ?? "",
      phone: settings?.businessInfo?.phone ?? "",
      email: settings?.businessInfo?.email ?? "",
      hours: settings?.businessInfo?.hours ?? "",
    },
    footerColumns: settings?.footerColumns ?? [],
    enableSidebarNav: settings?.enableSidebarNav ?? false,
    sidebarNavPosition: (settings?.sidebarNavPosition ?? "left") as "left" | "right",
    navScrollTransition: (settings?.navScrollTransition ?? "medium") as
      | "off"
      | "slow"
      | "semiSlow"
      | "medium"
      | "fast",
    headerSticky: settings?.headerSticky ?? true,
  };
}

export function SettingsForm({
  settings,
  homeSections,
}: {
  settings: SiteSettings | null;
  homeSections: { id: string; label: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, register } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toDefaultValues(settings),
  });

  const navLinks = useFieldArray({ control, name: "navLinks" });
  const socialLinks = useFieldArray({ control, name: "socialLinks" });
  const footerCols = useFieldArray({ control, name: "footerColumns" });

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
                <select
                  id="fontHeading"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  {...register("fontHeading")}
                >
                  {fontOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="fontBody">Body font</FieldLabel>
                <select
                  id="fontBody"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  {...register("fontBody")}
                >
                  {fontOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="baseFontSize">Base font size</FieldLabel>
                <select
                  id="baseFontSize"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  {...register("baseFontSize")}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>
            Fine-tune the font, size, color, and weight for each heading level and body text.
            Leave a field blank to fall back to the defaults above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {TYPOGRAPHY_ROLES.map((role) => (
              <div key={role.key} className="flex flex-col gap-2 rounded-lg border p-3">
                <p className="text-sm font-medium">{role.label}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Field>
                    <FieldLabel>Font</FieldLabel>
                    <select
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                      {...register(`typography.${role.key}.fontFamily` as const)}
                    >
                      <option value="">Default</option>
                      {fontOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field>
                    <FieldLabel>Size (rem)</FieldLabel>
                    <Controller
                      control={control}
                      name={`typography.${role.key}.fontSize` as const}
                      render={({ field }) => (
                        <Input
                          type="number"
                          step="0.05"
                          placeholder="1"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                          }
                        />
                      )}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Color</FieldLabel>
                    <Controller
                      control={control}
                      name={`typography.${role.key}.color` as const}
                      render={({ field }) => (
                        <ColorField
                          ariaLabel={`Color for ${role.label}`}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Background</FieldLabel>
                    <Controller
                      control={control}
                      name={`typography.${role.key}.backgroundColor` as const}
                      render={({ field }) => (
                        <ColorField
                          ariaLabel={`Background color for ${role.label}`}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Weight</FieldLabel>
                    <select
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                      {...register(`typography.${role.key}.fontWeight` as const)}
                    >
                      <option value="">Default</option>
                      <option value="400">400</option>
                      <option value="500">500</option>
                      <option value="600">600</option>
                      <option value="700">700</option>
                      <option value="800">800</option>
                    </select>
                  </Field>
                </div>
              </div>
            ))}
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
              <div key={field.id} className="flex items-start gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`navLinks.${index}.label`}>Label</FieldLabel>
                  <Input
                    id={`navLinks.${index}.label`}
                    placeholder="About"
                    {...register(`navLinks.${index}.label` as const)}
                  />
                </Field>
                <Controller
                  control={control}
                  name={`navLinks.${index}.href` as const}
                  render={({ field: hrefField }) => {
                    const isSection = homeSections.some(
                      (s) => hrefField.value === `/#${s.id}`
                    );
                    const selectVal = isSection ? hrefField.value : "__custom__";
                    return (
                      <Field className="flex-1">
                        <FieldLabel>Link</FieldLabel>
                        <select
                          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
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

            <hr className="my-2" />

            <Controller
              control={control}
              name="headerSticky"
              render={({ field }) => (
                <Field>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="headerSticky"
                    />
                    <FieldLabel htmlFor="headerSticky" className="mb-0">
                      Keep header visible while scrolling
                    </FieldLabel>
                  </div>
                  <FieldDescription>
                    When on, the header stays pinned to the top of the screen as visitors scroll
                    down the page.
                  </FieldDescription>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="enableSidebarNav"
              render={({ field }) => (
                <Field>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="enableSidebarNav"
                    />
                    <FieldLabel htmlFor="enableSidebarNav" className="mb-0">
                      Enable sidebar navigation
                    </FieldLabel>
                  </div>
                  <FieldDescription>
                    Replaces the top header with a persistent side panel on desktop and a drawer on
                    mobile.
                  </FieldDescription>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="sidebarNavPosition"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="sidebarNavPosition">Sidebar position</FieldLabel>
                  <select
                    id="sidebarNavPosition"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="navScrollTransition"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="navScrollTransition">Nav scroll transition</FieldLabel>
                  <select
                    id="navScrollTransition"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="off">Off</option>
                    <option value="slow">Slow</option>
                    <option value="semiSlow">Semi slow</option>
                    <option value="medium">Medium</option>
                    <option value="fast">Fast</option>
                  </select>
                  <FieldDescription>
                    Controls how nav links smoothly scroll down to a section.
                  </FieldDescription>
                </Field>
              )}
            />

            <hr className="my-2" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="headerCtaLabel">Header button label</FieldLabel>
                <Input
                  id="headerCtaLabel"
                  placeholder="603-283-8443"
                  {...register("headerCtaLabel")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="headerCtaHref">Header button link</FieldLabel>
                <Input
                  id="headerCtaHref"
                  placeholder="tel:6032838443"
                  {...register("headerCtaHref")}
                />
                <FieldDescription>
                  Leave both fields blank to hide the header button.
                </FieldDescription>
              </Field>
            </div>
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
          <CardTitle>Footer</CardTitle>
          <CardDescription>
            Add columns to the footer with headings, optional rich text, and links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
                <FooterColumnLinks
                  control={control}
                  register={register}
                  columnIndex={colIndex}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => footerCols.append({ heading: "", body: "", links: [] })}
            >
              <Plus /> Add column
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

function FooterColumnLinks({
  control,
  register,
  columnIndex,
}: {
  control: Control<SiteSettingsFormValues>;
  register: UseFormRegister<SiteSettingsFormValues>;
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
              {...register(
                `footerColumns.${columnIndex}.links.${linkIndex}.label` as const
              )}
            />
          </Field>
          <Field className="flex-1">
            <FieldLabel>URL</FieldLabel>
            <Input
              placeholder="/privacy"
              {...register(
                `footerColumns.${columnIndex}.links.${linkIndex}.href` as const
              )}
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
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ label: "", href: "" })}
      >
        <Plus /> Add link
      </Button>
    </div>
  );
}
