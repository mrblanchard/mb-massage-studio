"use client";

import { Palette, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateTypographySettings } from "@/app/admin/(dashboard)/settings/typography-actions";
import { ColorField } from "@/components/edit/color-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { fontOptions, fontRegistry } from "@/lib/fonts";
import { updateSectionStyle } from "@/lib/sections/actions";
import type { SectionStyleOverrides } from "@/lib/sections/section-style";
import type { SectionType } from "@/lib/sections/types";
import { typographyRoles, type TypographyRole } from "@/lib/theme/typography-schema";

const ROLE_LABELS: Record<TypographyRole, string> = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  body: "Body text",
  small: "Small text",
  button: "Buttons",
  link: "Links",
};

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  about: "About",
  services: "Services",
  gallery: "Gallery",
  testimonials: "Testimonials",
  cta: "Call to action",
  contact: "Contact",
  rich_text: "Rich text",
  blog_list: "Blog list",
  two_column: "Two column",
  columns: "Columns",
};

const BASE_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;

function fontFamilyValue(name: string | undefined) {
  if (!name) return undefined;
  const font = fontRegistry[name as keyof typeof fontRegistry];
  return font ? `var(${font.cssVar})` : undefined;
}

const numberInputClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function SpacingInputs({
  legend,
  prefix,
  overrides,
  onChange,
}: {
  legend: string;
  prefix: "padding" | "margin";
  overrides: SectionStyleOverrides;
  onChange: (patch: Partial<SectionStyleOverrides>) => void;
}) {
  const sides = [
    { key: "Top", label: "T" },
    { key: "Right", label: "R" },
    { key: "Bottom", label: "B" },
    { key: "Left", label: "L" },
  ] as const;

  return (
    <Field>
      <FieldLabel className="text-xs text-muted-foreground">{legend} (rem)</FieldLabel>
      <div className="grid grid-cols-4 gap-1.5">
        {sides.map(({ key, label }) => {
          const field = `${prefix}${key}` as keyof SectionStyleOverrides;
          const value = overrides[field] as number | undefined;
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{label}</span>
              <input
                type="number"
                step="0.25"
                value={value ?? ""}
                placeholder="0"
                onChange={(e) =>
                  onChange({
                    [field]: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                className={numberInputClass}
              />
            </div>
          );
        })}
      </div>
    </Field>
  );
}

export function StyleSidebar() {
  const {
    canEdit,
    isEditMode,
    styleSettings,
    setStyleSettings,
    isStyleSidebarOpen,
    setStyleSidebarOpen,
    scrollToStyleRole,
    clearStyleScrollRequest,
    sectionStyleTarget,
    setSectionStyleColor,
    setSectionStyleOverrides,
    clearSectionStyleTarget,
  } = useEditMode();
  const [isSaving, startTransition] = useTransition();
  const [highlightedRole, setHighlightedRole] = useState<TypographyRole | null>(null);
  const [isSectionCardHighlighted, setIsSectionCardHighlighted] = useState(false);
  const roleRefs = useRef<Partial<Record<TypographyRole, HTMLDivElement | null>>>({});
  const sectionCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollToStyleRole) return;
    const node = roleRefs.current[scrollToStyleRole];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setHighlightedRole(scrollToStyleRole);
    clearStyleScrollRequest();
    const timeout = setTimeout(() => setHighlightedRole(null), 1600);
    return () => clearTimeout(timeout);
  }, [scrollToStyleRole, clearStyleScrollRequest]);

  useEffect(() => {
    if (!sectionStyleTarget) return;
    sectionCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setIsSectionCardHighlighted(true);
    const timeout = setTimeout(() => setIsSectionCardHighlighted(false), 1600);
    return () => clearTimeout(timeout);
    // Only re-run when a *different* section is targeted, not on every color edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionStyleTarget?.id]);

  if (!canEdit || !isEditMode) {
    return null;
  }

  const handleSave = () => {
    startTransition(async () => {
      const results: Array<{ error?: string } | undefined> = await Promise.all([
        updateTypographySettings(styleSettings),
        sectionStyleTarget
          ? updateSectionStyle(sectionStyleTarget.id, {
              backgroundColor: sectionStyleTarget.backgroundColor || null,
              overrides: sectionStyleTarget.overrides,
            })
          : Promise.resolve(undefined),
      ]);
      const error = results.find((r) => r?.error)?.error;
      if (error) {
        toast.error(error);
      } else {
        toast.success("Styles saved.");
      }
    });
  };

  const updateRole = (role: TypographyRole, patch: Record<string, unknown>) => {
    setStyleSettings({
      ...styleSettings,
      typography: {
        ...styleSettings.typography,
        [role]: { ...styleSettings.typography[role], ...patch },
      },
    });
  };

  const resetRole = (role: TypographyRole) => {
    const next = { ...styleSettings.typography };
    delete next[role];
    setStyleSettings({ ...styleSettings, typography: next });
  };

  if (!isStyleSidebarOpen) {
    return (
      <div className="fixed left-6 bottom-6 z-40">
        <Button
          size="lg"
          className="gap-2 rounded-full shadow-lg shadow-black/10 transition-transform hover:scale-105"
          onClick={() => setStyleSidebarOpen(true)}
        >
          <Palette className="size-4" /> Styles
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 z-40 flex w-[26rem] flex-col bg-background/95 shadow-2xl ring-1 ring-foreground/10 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Palette className="size-4 text-primary" />
        </div>
        <div className="flex-1 leading-tight">
          <p className="font-heading text-base font-medium">Site styles</p>
          <p className="text-xs text-muted-foreground">Fonts, sizes &amp; colors</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          onClick={() => setStyleSidebarOpen(false)}
        >
          <X />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {sectionStyleTarget && (
          <Card
            size="sm"
            ref={sectionCardRef}
            className={cn(
              "mb-6 transition-shadow duration-300",
              isSectionCardHighlighted && "ring-2 ring-destructive ring-offset-2 ring-offset-background",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <div>
                <CardTitle>{SECTION_TYPE_LABELS[sectionStyleTarget.type]} section</CardTitle>
                <CardDescription>Background, border, padding &amp; margin</CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Stop editing this section"
                onClick={clearSectionStyleTarget}
              >
                <X className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field>
                <FieldLabel className="text-xs text-muted-foreground">Background</FieldLabel>
                <ColorField
                  ariaLabel="Section background color"
                  value={sectionStyleTarget.backgroundColor || undefined}
                  onChange={setSectionStyleColor}
                />
              </Field>

              <div className="grid grid-cols-3 gap-2.5">
                <Field className="col-span-1">
                  <FieldLabel className="text-xs text-muted-foreground">Border style</FieldLabel>
                  <Select
                    value={sectionStyleTarget.overrides.borderStyle ?? "none"}
                    onValueChange={(value) =>
                      setSectionStyleOverrides({
                        borderStyle: (value ?? "none") as SectionStyleOverrides["borderStyle"],
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="col-span-1">
                  <FieldLabel className="text-xs text-muted-foreground">Width (px)</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={sectionStyleTarget.overrides.borderWidth ?? ""}
                    placeholder="1"
                    disabled={!sectionStyleTarget.overrides.borderStyle || sectionStyleTarget.overrides.borderStyle === "none"}
                    onChange={(e) =>
                      setSectionStyleOverrides({
                        borderWidth: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className={cn(numberInputClass, "disabled:opacity-50")}
                  />
                </Field>
                <Field className="col-span-1">
                  <FieldLabel className="text-xs text-muted-foreground">Color</FieldLabel>
                  <ColorField
                    ariaLabel="Border color"
                    value={sectionStyleTarget.overrides.borderColor || undefined}
                    onChange={(value) => setSectionStyleOverrides({ borderColor: value || undefined })}
                  />
                </Field>
              </div>

              <SpacingInputs
                legend="Padding"
                prefix="padding"
                overrides={sectionStyleTarget.overrides}
                onChange={setSectionStyleOverrides}
              />
              <SpacingInputs
                legend="Margin"
                prefix="margin"
                overrides={sectionStyleTarget.overrides}
                onChange={setSectionStyleOverrides}
              />
            </CardContent>
          </Card>
        )}

        <Card size="sm" className="mb-6">
          <CardHeader>
            <CardTitle>Global</CardTitle>
            <CardDescription>Applies across the whole site</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Field>
              <FieldLabel>Heading font</FieldLabel>
              <Select
                value={styleSettings.fontHeading}
                onValueChange={(value) =>
                  setStyleSettings({ ...styleSettings, fontHeading: value ?? styleSettings.fontHeading })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Body font</FieldLabel>
              <Select
                value={styleSettings.fontBody}
                onValueChange={(value) =>
                  setStyleSettings({ ...styleSettings, fontBody: value ?? styleSettings.fontBody })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Base font size</FieldLabel>
              <div className="flex gap-1 rounded-lg border p-1">
                {BASE_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setStyleSettings({ ...styleSettings, baseFontSize: opt.value })
                    }
                    className={cn(
                      "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                      styleSettings.baseFontSize === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
          </CardContent>
        </Card>

        <p className="mb-3 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Element styles
        </p>

        <div className="flex flex-col gap-3">
          {typographyRoles.map((role) => {
            const roleValues = styleSettings.typography[role] ?? {};
            const hasCustomValues = Object.keys(roleValues).length > 0;
            const previewFontFamily = fontFamilyValue(roleValues.fontFamily);

            return (
              <Card
                key={role}
                size="sm"
                ref={(node) => {
                  roleRefs.current[role] = node;
                }}
                className={cn(
                  "transition-shadow duration-300",
                  highlightedRole === role && "ring-2 ring-destructive ring-offset-2 ring-offset-background",
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm"
                      style={{
                        fontFamily: previewFontFamily,
                        color: roleValues.color || undefined,
                        backgroundColor: roleValues.backgroundColor || undefined,
                        fontWeight: roleValues.fontWeight,
                      }}
                    >
                      Aa
                    </span>
                    <CardTitle>{ROLE_LABELS[role]}</CardTitle>
                  </div>
                  {hasCustomValues && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Reset ${ROLE_LABELS[role]}`}
                      onClick={() => resetRole(role)}
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-2.5">
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground">Font</FieldLabel>
                    <Select
                            value={roleValues.fontFamily ?? ""}
                      onValueChange={(value) => updateRole(role, { fontFamily: value ?? "" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground">Size (rem)</FieldLabel>
                      <input
                        type="number"
                        step="0.05"
                        value={roleValues.fontSize ?? ""}
                        onChange={(e) =>
                          updateRole(role, {
                            fontSize: e.target.value === "" ? undefined : Number(e.target.value),
                          })
                        }
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground">Weight</FieldLabel>
                      <Select
                        value={roleValues.fontWeight ?? ""}
                        onValueChange={(value) =>
                          updateRole(role, { fontWeight: value ?? undefined })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          {["400", "500", "600", "700", "800"].map((w) => (
                            <SelectItem key={w} value={w}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground">Color</FieldLabel>
                      <ColorField
                        ariaLabel={`Color for ${ROLE_LABELS[role]}`}
                        value={roleValues.color}
                        onChange={(value) => updateRole(role, { color: value })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs text-muted-foreground">Background</FieldLabel>
                      <ColorField
                        ariaLabel={`Background color for ${ROLE_LABELS[role]}`}
                        value={roleValues.backgroundColor}
                        onChange={(value) => updateRole(role, { backgroundColor: value })}
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="border-t bg-background/90 p-4 backdrop-blur-sm">
        <Button disabled={isSaving} onClick={handleSave} className="w-full">
          {isSaving ? "Saving..." : "Save styles"}
        </Button>
      </div>
    </div>
  );
}
