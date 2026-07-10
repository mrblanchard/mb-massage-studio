import type { CSSProperties } from "react";

export interface SectionStyleOverrides {
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderWidth?: number; // px
  marginTop?: number; // rem
  marginRight?: number; // rem
  marginBottom?: number; // rem
  marginLeft?: number; // rem
  paddingTop?: number; // rem
  paddingRight?: number; // rem
  paddingBottom?: number; // rem
  paddingLeft?: number; // rem
}

const rem = (value: number | undefined) => (value != null ? `${value}rem` : undefined);

/** Border + margin — applied on the outer SectionWrapper div (full section box). */
export function borderAndMarginStyle(o: SectionStyleOverrides): CSSProperties {
  const style: CSSProperties = {
    marginTop: rem(o.marginTop),
    marginRight: rem(o.marginRight),
    marginBottom: rem(o.marginBottom),
    marginLeft: rem(o.marginLeft),
  };
  if (o.borderStyle && o.borderStyle !== "none") {
    style.borderStyle = o.borderStyle;
    style.borderColor = o.borderColor || "currentColor";
    style.borderWidth = `${o.borderWidth ?? 1}px`;
  }
  return style;
}

/** Padding — applied on each section component's own root/content element. */
export function paddingStyle(o: SectionStyleOverrides): CSSProperties {
  return {
    paddingTop: rem(o.paddingTop),
    paddingRight: rem(o.paddingRight),
    paddingBottom: rem(o.paddingBottom),
    paddingLeft: rem(o.paddingLeft),
  };
}
