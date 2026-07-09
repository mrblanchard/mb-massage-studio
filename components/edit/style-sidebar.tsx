"use client";

import { Palette, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateTypographySettings } from "@/app/admin/(dashboard)/settings/typography-actions";
import { ColorField } from "@/components/edit/color-field";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { fontOptions } from "@/lib/fonts";
import { typographyRoles, type TypographyRole } from "@/lib/theme/typography-schema";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

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
  } = useEditMode();
  const [isSaving, startTransition] = useTransition();
  const [highlightedRole, setHighlightedRole] = useState<TypographyRole | null>(null);
  const roleRefs = useRef<Partial<Record<TypographyRole, HTMLDivElement | null>>>({});

  useEffect(() => {
    if (!scrollToStyleRole) return;
    const node = roleRefs.current[scrollToStyleRole];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setHighlightedRole(scrollToStyleRole);
    clearStyleScrollRequest();
    const timeout = setTimeout(() => setHighlightedRole(null), 1500);
    return () => clearTimeout(timeout);
  }, [scrollToStyleRole, clearStyleScrollRequest]);

  if (!canEdit || !isEditMode) {
    return null;
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateTypographySettings(styleSettings);
      if (result?.error) {
        toast.error(result.error);
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

  if (!isStyleSidebarOpen) {
    return (
      <div className="fixed left-6 bottom-6 z-40">
        <Button size="lg" className="shadow-lg" onClick={() => setStyleSidebarOpen(true)}>
          <Palette /> Styles
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 z-40 flex w-80 flex-col gap-4 overflow-y-auto border-r bg-background p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Site styles</p>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          onClick={() => setStyleSidebarOpen(false)}
        >
          <X />
        </Button>
      </div>

      <Field>
        <FieldLabel htmlFor="style-fontHeading">Heading font</FieldLabel>
        <select
          id="style-fontHeading"
          className={selectClass}
          value={styleSettings.fontHeading}
          onChange={(e) => setStyleSettings({ ...styleSettings, fontHeading: e.target.value })}
        >
          {fontOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>

      <Field>
        <FieldLabel htmlFor="style-fontBody">Body font</FieldLabel>
        <select
          id="style-fontBody"
          className={selectClass}
          value={styleSettings.fontBody}
          onChange={(e) => setStyleSettings({ ...styleSettings, fontBody: e.target.value })}
        >
          {fontOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>

      <Field>
        <FieldLabel htmlFor="style-baseFontSize">Base font size</FieldLabel>
        <select
          id="style-baseFontSize"
          className={selectClass}
          value={styleSettings.baseFontSize}
          onChange={(e) =>
            setStyleSettings({
              ...styleSettings,
              baseFontSize: e.target.value as "small" | "medium" | "large",
            })
          }
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </Field>

      <hr />
      <p className="text-sm font-medium">Typography</p>

      {typographyRoles.map((role) => {
        const roleValues = styleSettings.typography[role] ?? {};
        return (
          <div
            key={role}
            ref={(node) => {
              roleRefs.current[role] = node;
            }}
            className={cn(
              "flex flex-col gap-2 rounded-lg border p-3 transition-shadow duration-300",
              highlightedRole === role && "ring-2 ring-destructive",
            )}
          >
            <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
            <Field>
              <FieldLabel>Font</FieldLabel>
              <select
                className={selectClass}
                value={roleValues.fontFamily ?? ""}
                onChange={(e) => updateRole(role, { fontFamily: e.target.value })}
              >
                <option value="">Default</option>
                {fontOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel>Size (rem)</FieldLabel>
                <Input
                  type="number"
                  step="0.05"
                  value={roleValues.fontSize ?? ""}
                  onChange={(e) =>
                    updateRole(role, {
                      fontSize: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Color</FieldLabel>
                <ColorField
                  ariaLabel={`Color for ${ROLE_LABELS[role]}`}
                  value={roleValues.color}
                  onChange={(value) => updateRole(role, { color: value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel>Background</FieldLabel>
                <ColorField
                  ariaLabel={`Background color for ${ROLE_LABELS[role]}`}
                  value={roleValues.backgroundColor}
                  onChange={(value) => updateRole(role, { backgroundColor: value })}
                />
              </Field>
              <Field>
                <FieldLabel>Weight</FieldLabel>
                <select
                  className={selectClass}
                  value={roleValues.fontWeight ?? ""}
                  onChange={(e) => updateRole(role, { fontWeight: e.target.value })}
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
        );
      })}

      <Button disabled={isSaving} onClick={handleSave}>
        {isSaving ? "Saving..." : "Save styles"}
      </Button>
    </div>
  );
}
