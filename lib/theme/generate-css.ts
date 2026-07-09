import { resolveFont } from "@/lib/fonts";
import type { TypographyRole, TypographyValues } from "@/lib/theme/typography-schema";

const ROLE_SELECTORS: Record<TypographyRole, string> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  small: "small",
  button: "[data-slot='button']",
  link: "a:not([data-slot='button'])",
};

export function generateTypographyCss(typography: TypographyValues): string {
  const rules: string[] = [];

  for (const role of Object.keys(ROLE_SELECTORS) as TypographyRole[]) {
    const settings = typography[role];
    if (!settings) continue;

    const declarations: string[] = [];
    if (settings.fontFamily) {
      declarations.push(`font-family: var(${resolveFont(settings.fontFamily).cssVar})`);
    }
    if (settings.fontSize) declarations.push(`font-size: ${settings.fontSize}rem`);
    if (settings.color) declarations.push(`color: ${settings.color}`);
    if (settings.backgroundColor) {
      declarations.push(`background-color: ${settings.backgroundColor}`);
    }
    if (settings.fontWeight) declarations.push(`font-weight: ${settings.fontWeight}`);
    if (settings.letterSpacing !== undefined) {
      declarations.push(`letter-spacing: ${settings.letterSpacing}em`);
    }
    if (settings.lineHeight !== undefined) declarations.push(`line-height: ${settings.lineHeight}`);

    if (declarations.length === 0) continue;
    rules.push(`.site-content ${ROLE_SELECTORS[role]} { ${declarations.join("; ")}; }`);
  }

  return rules.join("\n");
}
