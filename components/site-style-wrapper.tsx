"use client";

import type { ReactNode } from "react";

import { StyleClickRouter } from "@/components/edit/style-click-router";
import { resolveFont } from "@/lib/fonts";
import { useEditMode } from "@/lib/edit/edit-mode-context";
import { generateTypographyCss } from "@/lib/theme/generate-css";
import { cn } from "@/lib/utils";

const baseFontSizes = { small: "1rem", medium: "1.125rem", large: "1.25rem" } as const;

export function SiteStyleWrapper({ children }: { children: ReactNode }) {
  const { styleSettings, isEditMode } = useEditMode();

  const headingFont = resolveFont(styleSettings.fontHeading);
  const bodyFont = resolveFont(styleSettings.fontBody);
  const typographyCss = generateTypographyCss(styleSettings.typography ?? {});

  const fontStyle = {
    "--font-heading": `var(${headingFont.cssVar})`,
    "--font-heading-weight": headingFont.headingWeight,
    fontFamily: `var(${bodyFont.cssVar})`,
    fontSize: baseFontSizes[styleSettings.baseFontSize] ?? baseFontSizes.medium,
  } as React.CSSProperties;

  return (
    <>
      {typographyCss && <style dangerouslySetInnerHTML={{ __html: typographyCss }} />}
      <StyleClickRouter />
      <div
        className={cn("site-content flex flex-1 flex-col md:flex-row", isEditMode && "is-edit-mode")}
        style={fontStyle}
      >
        {children}
      </div>
    </>
  );
}
